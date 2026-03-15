import { Router, Request, Response } from "express";
import { prisma, creditTradingBalance, debitTradingBalance, InsufficientBalanceError, queryHoldingsByUser } from "@arbitium/db";
import { requireAuth } from "../middleware/auth.js";
import { resolveArbitiumUser } from "../middleware/resolveArbitiumUser.js";
import type { ArbitriumUserRequest } from "../middleware/resolveArbitiumUser.js";
import { TransferBodySchema } from "../schemas.js";
import { callVaultlyBridge } from "../vautlyClient.js";


export const transfersRouter = Router();

export async function recoverRollbackPendingWithdrawals(): Promise<void> {
    const stuckTransfers = await prisma.balanceTransfer.findMany({
        where: { status: "ROLLBACK_PENDING", direction: "WITHDRAW" },
    });

    if (stuckTransfers.length === 0) return;

    console.warn(`[transfers recovery] found ${stuckTransfers.length} ROLLBACK_PENDING withdrawals — crediting back`);

    for (const transfer of stuckTransfers) {
        try {
            await prisma.$transaction(async (tx) => {
                await creditTradingBalance({
                    prisma: tx,
                    userId: transfer.userId,
                    amountInPaise: transfer.amountInPaise,
                });
                await tx.balanceTransfer.update({
                    where: { id: transfer.id },
                    data: { status: "FAILED" },
                });
            });
            console.log(`[transfers recovery] rolled back transfer=${transfer.id} userId=${transfer.userId}`);
        } catch (error) {
            console.error(`[transfers recovery] failed to rollback transfer=${transfer.id}:`, error);
        }
    }
}

transfersRouter.get(
    "/balance",
    requireAuth,
    resolveArbitiumUser,
    async (req: Request, res: Response) => {
        const arbitiumUserId = (req as ArbitriumUserRequest).arbitiumUserId

        const balance = await prisma.tradingBalance.findUnique({
            where: { userId: arbitiumUserId },
            select: { available: true, locked: true },
        })

        const bonusGranted = (req as ArbitriumUserRequest).welcomeBonusGranted ?? false

        res.json({
            available: (balance?.available ?? 0n).toString(),
            locked: (balance?.locked ?? 0n).toString(),
            welcomeBonusGranted: bonusGranted
        })
    }
)

transfersRouter.post(
    "/deposit",
    requireAuth,
    resolveArbitiumUser,
    async (req: Request, res: Response) => {
        const parsed = TransferBodySchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.flatten() });
            return;
        }

        const { amountInPaise, idempotencyKey } = parsed.data;
        const authReq = req as ArbitriumUserRequest;

        let transfer: { id: string; status: string };

        const existingTransfer = await prisma.balanceTransfer.findUnique({
            where: { idempotencyKey },
        });

        if (existingTransfer) {
            res.status(200).json({ transferId: existingTransfer.id, status: existingTransfer.status });
            return;
        }

        try {
            transfer = await prisma.balanceTransfer.create({
                data: {
                    userId: authReq.arbitiumUserId,
                    direction: "DEPOSIT",
                    amountInPaise,
                    idempotencyKey,
                    status: "PENDING",
                },
            });
        } catch (createError: unknown) {
            if ((createError as { code?: string }).code === "P2002") {
                const raced = await prisma.balanceTransfer.findUnique({
                    where: { idempotencyKey },
                });
                if (raced) {
                    res.status(200).json({ transferId: raced.id, status: raced.status });
                    return;
                }
            }
            throw createError;
        }

        const bridgeResult = await callVaultlyBridge({
            vaultlyUserId: authReq.vaultlyUserId,
            amountInPaise: Number(amountInPaise),
            direction: "DEPOSIT",
            idempotencyKey,
        });

        if (!bridgeResult.success) {
            await prisma.balanceTransfer.update({
                where: { id: transfer.id },
                data: { status: "FAILED" },
            });
            res.status(422).json({ error: bridgeResult.error });
            return;
        }

        await prisma.$transaction(async (tx) => {
            await creditTradingBalance({
                prisma: tx,
                userId: authReq.arbitiumUserId,
                amountInPaise
            })

            await tx.balanceTransfer.update({
                where: { id: transfer.id },
                data: {
                    status: "COMPLETED",
                    resolvedAt: new Date()
                },
            })
        })

        res.status(200).json({ transferId: transfer.id, status: "COMPLETED" });
    }
);

transfersRouter.post(
    "/withdraw",
    requireAuth,
    resolveArbitiumUser,
    async (req: Request, res: Response) => {
        const parsed = TransferBodySchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.flatten() });
            return;
        }

        const { amountInPaise, idempotencyKey } = parsed.data;
        const authReq = req as ArbitriumUserRequest;

        const existing = await prisma.balanceTransfer.findUnique({
            where: { idempotencyKey },
        });
        if (existing) {
            res.status(200).json({ transferId: existing.id, status: existing.status });
            return;
        }

        const transfer = await prisma.balanceTransfer.create({
            data: {
                userId: authReq.arbitiumUserId,
                direction: "WITHDRAW",
                amountInPaise,
                idempotencyKey,
                status: "PENDING",
            },
        });

        try {
            await prisma.$transaction(async (tx) => {
                await debitTradingBalance({
                    prisma: tx as typeof prisma,
                    userId: authReq.arbitiumUserId,
                    amountInPaise,
                });
                await tx.balanceTransfer.update({
                    where: { id: transfer.id },
                    data: { status: "ROLLBACK_PENDING" },
                });
            });
        } catch (error) {
            await prisma.balanceTransfer.update({
                where: { id: transfer.id },
                data: { status: "FAILED" },
            });
            if (error instanceof InsufficientBalanceError) {
                res.status(422).json({ error: "Insufficient trading balance" });
                return;
            }
            res.status(500).json({ error: "Debit failed" });
            return;
        }

        const bridgeResult = await callVaultlyBridge({
            vaultlyUserId: authReq.vaultlyUserId,
            amountInPaise: Number(amountInPaise),
            direction: "WITHDRAW",
            idempotencyKey,
        });

        if (!bridgeResult.success) {
            await prisma.$transaction(async (tx) => {
                await creditTradingBalance({
                    prisma: tx,
                    userId: authReq.arbitiumUserId,
                    amountInPaise,
                });
                await tx.balanceTransfer.update({
                    where: { id: transfer.id },
                    data: { status: "FAILED" },
                });
            });
            res.status(502).json({ error: "Withdrawal failed — balance restored" });
            return;
        }

        await prisma.balanceTransfer.update({
            where: { id: transfer.id },
            data: { status: "COMPLETED", resolvedAt: new Date() },
        });

        res.status(200).json({ transferId: transfer.id, status: "COMPLETED" });
    }
);

transfersRouter.get(
    "/holdings",
    requireAuth,
    resolveArbitiumUser,
    async (req: Request, res: Response) => {
        const userId = (req as ArbitriumUserRequest).arbitiumUserId;
        const holdings = await queryHoldingsByUser({ prisma, userId });
        res.json({ holdings });
    }
);
