import { Router, Request, Response } from "express";
import { prisma, creditTradingBalance, debitTradingBalance, InsufficientBalanceError, queryHoldingsByUser, queryAssetBalancesByUser } from "@arbitium/db";
import { requireAuth } from "../middleware/auth.js";
import { resolveArbitiumUser } from "../middleware/resolveArbitiumUser.js";
import type { ArbitriumUserRequest } from "../middleware/resolveArbitiumUser.js";
import { TransferBodySchema } from "../schemas.js";
import { callVaultlyBridge } from "../vaultlyClient.js";

export const transfersRouter = Router();

const RECONCILE_INTERVAL_MS = 60_000;
const MAX_ATTEMPTS = 10;

const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

function checkRateLimit(userId: string, res: Response): boolean {
    const now = Date.now();
    const timestamps = rateLimitMap.get(userId) ?? [];
    const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (recent.length >= RATE_LIMIT_MAX) {
        res.status(429).json({ error: "Rate limit exceeded" });
        return false;
    }
    recent.push(now);
    rateLimitMap.set(userId, recent);
    return true;
}

function checkReplayMismatch(
    existing: { userId: string; amountInPaise: bigint; direction: string },
    authReq: ArbitriumUserRequest,
    amountInPaise: bigint,
    direction: string,
    res: Response,
): boolean {
    if (
        existing.userId !== authReq.arbitiumUserId ||
        existing.amountInPaise !== amountInPaise ||
        existing.direction !== direction
    ) {
        res.status(409).json({ error: "IDEMPOTENCY_MISMATCH" });
        return false;
    }
    return true;
}

async function resolveAndCompleteDeposit(
    transfer: { id: string; userId: string; amountInPaise: bigint; vaultlyUserId: string | undefined; idempotencyKey: string },
): Promise<boolean> {
    const bridgeResult = await callVaultlyBridge({
        vaultlyUserId: transfer.vaultlyUserId ?? "unknown",
        amountInPaise: Number(transfer.amountInPaise),
        direction: "DEPOSIT",
        idempotencyKey: transfer.idempotencyKey,
    });

    if (bridgeResult.success) {
        await prisma.$transaction(async (tx) => {
            await creditTradingBalance({
                prisma: tx,
                userId: transfer.userId,
                amountInPaise: transfer.amountInPaise,
            });
            await tx.balanceTransfer.update({
                where: { id: transfer.id },
                data: {
                    status: "COMPLETED",
                    resolvedAt: new Date(),
                    vaultlyRef: bridgeResult.ref ?? undefined,
                    attempts: { increment: 1 },
                    lastAttemptAt: new Date(),
                },
            });
        });
        return true;
    }

    if (!bridgeResult.ambiguous) {
        await prisma.balanceTransfer.update({
            where: { id: transfer.id },
            data: {
                status: "FAILED",
                attempts: { increment: 1 },
                lastAttemptAt: new Date(),
            },
        });
        return true;
    }

    await prisma.balanceTransfer.update({
        where: { id: transfer.id },
        data: {
            attempts: { increment: 1 },
            lastAttemptAt: new Date(),
        },
    });
    return false;
}

async function resolveAndCompleteWithdrawal(
    transfer: { id: string; userId: string; amountInPaise: bigint; vaultlyUserId: string | undefined; idempotencyKey: string },
): Promise<boolean> {
    const bridgeResult = await callVaultlyBridge({
        vaultlyUserId: transfer.vaultlyUserId ?? "unknown",
        amountInPaise: Number(transfer.amountInPaise),
        direction: "WITHDRAW",
        idempotencyKey: transfer.idempotencyKey,
    });

    if (bridgeResult.success) {
        await prisma.balanceTransfer.update({
            where: { id: transfer.id },
            data: {
                status: "COMPLETED",
                resolvedAt: new Date(),
                vaultlyRef: bridgeResult.ref ?? undefined,
                attempts: { increment: 1 },
                lastAttemptAt: new Date(),
            },
        });
        return true;
    }

    if (!bridgeResult.ambiguous) {
        await prisma.$transaction(async (tx) => {
            await creditTradingBalance({
                prisma: tx,
                userId: transfer.userId,
                amountInPaise: transfer.amountInPaise,
            });
            await tx.balanceTransfer.update({
                where: { id: transfer.id },
                data: {
                    status: "FAILED",
                    attempts: { increment: 1 },
                    lastAttemptAt: new Date(),
                },
            });
        });
        return true;
    }

    await prisma.balanceTransfer.update({
        where: { id: transfer.id },
        data: {
            attempts: { increment: 1 },
            lastAttemptAt: new Date(),
        },
    });
    return false;
}

export async function reconcilePendingTransfers(): Promise<void> {
    const pending = await prisma.balanceTransfer.findMany({
        where: {
            OR: [
                { status: "PENDING", direction: "DEPOSIT" },
                { status: "ROLLBACK_PENDING", direction: "WITHDRAW" },
            ],
            attempts: { lt: MAX_ATTEMPTS },
        },
        include: { user: { select: { vaultlyUserId: true } } },
    });

    if (pending.length === 0) return;

    console.log(`[reconcile] sweeping ${pending.length} pending transfers`);

    for (const transfer of pending) {
        try {
            const isDeposit = transfer.direction === "DEPOSIT";
            const args = {
                id: transfer.id,
                userId: transfer.userId,
                amountInPaise: transfer.amountInPaise,
                vaultlyUserId: transfer.user.vaultlyUserId,
                idempotencyKey: transfer.idempotencyKey,
            };
            const done = isDeposit
                ? await resolveAndCompleteDeposit(args)
                : await resolveAndCompleteWithdrawal(args);
            if (done) {
                console.log(`[reconcile] resolved transfer=${transfer.id} status=${transfer.status}`);
            }
        } catch (error) {
            console.error(`[reconcile] failed transfer=${transfer.id}:`, error);
        }
    }

    const stuck = await prisma.balanceTransfer.findMany({
        where: {
            OR: [
                { status: "PENDING", direction: "DEPOSIT" },
                { status: "ROLLBACK_PENDING", direction: "WITHDRAW" },
            ],
            attempts: { gte: MAX_ATTEMPTS },
        },
    });
    if (stuck.length > 0) {
        console.error(`[reconcile] ${stuck.length} transfers stuck at max attempts — manual review needed`);
        for (const t of stuck) {
            console.error(`[reconcile] stuck: id=${t.id} userId=${t.userId} key=${t.idempotencyKey} attempts=${t.attempts}`);
        }
    }
}

transfersRouter.get(
    "/balance",
    requireAuth,
    resolveArbitiumUser,
    async (req: Request, res: Response) => {
        const arbitiumUserId = (req as ArbitriumUserRequest).arbitiumUserId;

        const balance = await prisma.tradingBalance.findUnique({
            where: { userId: arbitiumUserId },
            select: { available: true, locked: true },
        });

        const bonusGranted = (req as ArbitriumUserRequest).welcomeBonusGranted ?? false;

        res.json({
            available: (balance?.available ?? 0n).toString(),
            locked: (balance?.locked ?? 0n).toString(),
            welcomeBonusGranted: bonusGranted,
        });
    }
);

transfersRouter.post(
    "/deposit",
    requireAuth,
    resolveArbitiumUser,
    async (req: Request, res: Response) => {
        if (!checkRateLimit((req as ArbitriumUserRequest).arbitiumUserId, res)) return;

        const parsed = TransferBodySchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.flatten() });
            return;
        }

        const { amountInPaise, idempotencyKey } = parsed.data;
        const authReq = req as ArbitriumUserRequest;

        const existingTransfer = await prisma.balanceTransfer.findUnique({
            where: { idempotencyKey },
        });

        if (existingTransfer) {
            if (!checkReplayMismatch(existingTransfer, authReq, amountInPaise, "DEPOSIT", res)) return;
            res.status(200).json({ transferId: existingTransfer.id, status: existingTransfer.status });
            return;
        }

        let transfer: { id: string; status: string };

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
                    if (!checkReplayMismatch(raced, authReq, amountInPaise, "DEPOSIT", res)) return;
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

        if (!bridgeResult.success && bridgeResult.ambiguous) {
            res.status(202).json({ transferId: transfer.id, status: "PENDING" });
            return;
        }

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
                amountInPaise,
            });

            await tx.balanceTransfer.update({
                where: { id: transfer.id },
                data: {
                    status: "COMPLETED",
                    resolvedAt: new Date(),
                    vaultlyRef: bridgeResult.ref ?? undefined,
                },
            });
        });

        res.status(200).json({ transferId: transfer.id, status: "COMPLETED" });
    }
);

transfersRouter.post(
    "/withdraw",
    requireAuth,
    resolveArbitiumUser,
    async (req: Request, res: Response) => {
        if (!checkRateLimit((req as ArbitriumUserRequest).arbitiumUserId, res)) return;

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
            if (!checkReplayMismatch(existing, authReq, amountInPaise, "WITHDRAW", res)) return;
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
            await prisma.balanceTransfer.update({
                where: { id: transfer.id },
                data: { status: "ROLLBACK_PENDING" },
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
            console.error("[withdraw] debitTradingBalance failed:", error);
            res.status(500).json({ error: "Debit failed" });
            return;
        }

        const bridgeResult = await callVaultlyBridge({
            vaultlyUserId: authReq.vaultlyUserId,
            amountInPaise: Number(amountInPaise),
            direction: "WITHDRAW",
            idempotencyKey,
        });

        if (!bridgeResult.success && bridgeResult.ambiguous) {
            res.status(202).json({ transferId: transfer.id, status: "ROLLBACK_PENDING" });
            return;
        }

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
            res.status(422).json({ error: bridgeResult.error });
            return;
        }

        await prisma.balanceTransfer.update({
            where: { id: transfer.id },
            data: {
                status: "COMPLETED",
                resolvedAt: new Date(),
                vaultlyRef: bridgeResult.ref ?? undefined,
            },
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

transfersRouter.get(
    "/history",
    requireAuth,
    resolveArbitiumUser,
    async (req: Request, res: Response) => {
        const userId = (req as ArbitriumUserRequest).arbitiumUserId;
        const transfers = await prisma.balanceTransfer.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 20,
            select: {
                id: true,
                direction: true,
                amountInPaise: true,
                status: true,
                createdAt: true,
            },
        });
        res.json({
            transfers: transfers.map((t) => ({
                ...t,
                amountInPaise: t.amountInPaise.toString(),
                createdAt: t.createdAt.toISOString(),
            })),
        });
    }
);
