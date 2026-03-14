import { Router, Request, Response } from "express";
import { prisma, creditTradingBalance, debitTradingBalance, InsufficientBalanceError, queryHoldingsByUser } from "@arbitium/db";
import { requireAuth } from "../middleware/auth.js";
import { resolveArbitiumUser } from "../middleware/resolveArbitiumUser.js";
import type { ArbitriumUserRequest } from "../middleware/resolveArbitiumUser.js";
import { TransferBodySchema } from "../schemas.js";
import { callVaultlyBridge } from "../vautlyClient.js";


export const transfersRouter = Router();

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
                direction: "DEPOSIT",
                amountInPaise,
                idempotencyKey,
                status: "PENDING",
            },
        });

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
            await debitTradingBalance({
                prisma,
                userId: authReq.arbitiumUserId,
                amountInPaise,
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
            await creditTradingBalance({
                prisma,
                userId: authReq.arbitiumUserId,
                amountInPaise,
            });
            await prisma.balanceTransfer.update({
                where: { id: transfer.id },
                data: { status: "FAILED" },
            });
            res.status(502).json({ error: "Vaultly credit failed — balance restored" });
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
