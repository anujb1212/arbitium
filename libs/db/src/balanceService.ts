import { OrderSide, Prisma, PrismaClient } from "../generated/prisma";
import { ensureAssetBalance, lockAssetForSell, releaseAssetLock, consumeAssetLockOnSell, creditAssetOnBuy, queryAssetBalancesByUser } from "./assetBalanceService";

export type LockBalanceArgs = {
    prisma: PrismaClient;
    userId: string;
    orderId: string;
    commandId: string;
    market: string;
    side: OrderSide;
    price: bigint;
    qty: bigint;
};

export type LockMarketOrderArgs = {
    prisma: PrismaClient;
    userId: string;
    orderId: string;
    commandId: string;
    market: string;
    side: OrderSide;
    qty: bigint;
};

export type ReleaseOrConsumeArgs = {
    prisma: PrismaClient | Prisma.TransactionClient;
    orderId: string;
};

export type CreditBalanceArgs = {
    prisma: PrismaClient | Prisma.TransactionClient;
    userId: string;
    amountInPaise: bigint;
};

export type DebitBalanceArgs = {
    prisma: PrismaClient;
    userId: string;
    amountInPaise: bigint;
};

export type ConsumeOnFillArgs = {
    tx: Prisma.TransactionClient;
    orderId: string;
    filledQty: bigint;
    fillPrice: bigint;
};

export type CreditFillProceedsArgs = {
    tx: Prisma.TransactionClient;
    orderId: string;
    fillPrice: bigint;
    fillQty: bigint;
};

function assetFromMarket(market: string): string {
    return market.split("-")[0] ?? market;
}

export async function lockBalanceForOrder(args: LockBalanceArgs): Promise<void> {
    const { prisma, userId, orderId, commandId, market, side, price, qty } = args;

    const lockedAmount = side === "BUY" ? price * qty : 0n;

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.tradingBalance.upsert({
            where: { userId },
            update: {},
            create: { userId, available: 0n, locked: 0n },
        });

        await tx.$queryRaw`
      SELECT id FROM "TradingBalance"
      WHERE "userId" = ${userId}
      FOR UPDATE
    `;

        if (side === "SELL") {
            const asset = assetFromMarket(market);
            await lockAssetForSell(tx, userId, market, asset, qty);
        }

        if (side === "BUY") {
            const balance = await tx.tradingBalance.findUnique({
                where: { userId },
            });

            if (!balance || balance.available < lockedAmount) {
                throw new InsufficientBalanceError(
                    `Insufficient balance: available=${balance?.available ?? 0n} required=${lockedAmount}`
                );
            }

            await tx.tradingBalance.update({
                where: { userId },
                data: {
                    available: { decrement: lockedAmount },
                    locked: { increment: lockedAmount },
                },
            });
        }

        await tx.order.create({
            data: {
                id: orderId,
                userId,
                commandId,
                market,
                side,
                price,
                qty,
                filledQty: 0n,
                lockedAmount,
                status: "PENDING",
            },
        });
    });
}

async function releaseLockCore(tx: Prisma.TransactionClient, orderId: string): Promise<void> {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) return;

    if (order.status === "CANCELLED" || order.status === "FILLED" || order.status === "REJECTED") return;

    if (order.side === "BUY") {
        const remainingInr = order.lockedAmount - order.consumedLocked;
        if (remainingInr > 0n) {
            await tx.tradingBalance.update({
                where: { userId: order.userId },
                data: {
                    available: { increment: remainingInr },
                    locked: { decrement: remainingInr },
                },
            });
        }
    }

    if (order.side === "SELL") {
        const filledQty = order.filledQty;
        const lockedQty = order.qty;
        const unfilledQty = lockedQty - filledQty;
        if (unfilledQty > 0n) {
            await releaseAssetLock(tx, order.userId, order.market, unfilledQty);
        }
    }

    await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
    });
}

export async function releaseLockForOrder(args: ReleaseOrConsumeArgs): Promise<void> {
    const { prisma, orderId } = args;

    if ("$transaction" in prisma) {
        await prisma.$transaction((tx) => releaseLockCore(tx, orderId));
    } else {
        await releaseLockCore(prisma, orderId);
    }
}

export async function settleMarketOrder(args: { prisma: PrismaClient; orderId: string }): Promise<void> {
    const { prisma, orderId } = args;

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const order = await tx.order.findUnique({ where: { id: orderId } });
        if (!order || order.orderType !== "MARKET") return;
        if (order.status === "CANCELLED" || order.status === "REJECTED") return;

        if (order.side === "BUY") {
            const remainingLocked = order.lockedAmount - order.consumedLocked;
            if (remainingLocked > 0n) {
                await tx.$queryRaw`
                    SELECT id FROM "TradingBalance"
                    WHERE "userId" = ${order.userId}
                    FOR UPDATE
                `;

                await tx.tradingBalance.update({
                    where: { userId: order.userId },
                    data: {
                        available: { increment: remainingLocked },
                        locked: { decrement: remainingLocked },
                    },
                });
            }
        }

        if (order.side === "SELL") {
            const unfilledQty = order.qty - order.filledQty;
            if (unfilledQty > 0n) {
                await releaseAssetLock(tx, order.userId, order.market, unfilledQty);
            }
        }

        const finalStatus = order.filledQty > 0n ? "FILLED" : "CANCELLED";
        await tx.order.update({
            where: { id: orderId },
            data: {
                status: finalStatus,
                consumedLocked: order.lockedAmount,
            },
        });
    });
}

export async function consumeLockOnFill(args: ConsumeOnFillArgs): Promise<void> {
    const { tx, orderId, filledQty, fillPrice } = args;

    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) return;

    if (order.side === "BUY") {
        const reservedForFill = order.orderType === "MARKET"
            ? fillPrice * filledQty
            : order.price * filledQty;

        const newFilledQty = order.filledQty + filledQty;
        const isFullyFilled = newFilledQty >= order.qty;

        const actualCost = fillPrice * filledQty;
        const refund = reservedForFill - actualCost;

        if (reservedForFill > 0n) {
            await tx.$queryRaw`
                SELECT id FROM "TradingBalance"
                WHERE "userId" = ${order.userId}
                FOR UPDATE
            `;

            await tx.tradingBalance.update({
                where: { userId: order.userId },
                data: {
                    locked: { decrement: reservedForFill },
                    ...(refund > 0n ? {
                        available: { increment: refund }
                    } : {}),
                },
            });
        }

        await creditAssetOnBuy(tx, order.userId, order.market, assetFromMarket(order.market), filledQty);

        await tx.order.update({
            where: { id: orderId },
            data: {
                filledQty: newFilledQty,
                consumedLocked: { increment: reservedForFill },
                status: isFullyFilled ? "FILLED" : "PARTIALLY_FILLED",
            },
        });
    }

    if (order.side === "SELL") {
        const newFilledQty = order.filledQty + filledQty;
        const isFullyFilled = newFilledQty >= order.qty;

        await consumeAssetLockOnSell(tx, order.userId, order.market, filledQty);

        await tx.order.update({
            where: { id: orderId },
            data: {
                filledQty: newFilledQty,
                status: isFullyFilled ? "FILLED" : "PARTIALLY_FILLED",
            },
        });
    }
}

export async function creditFillProceeds(args: CreditFillProceedsArgs): Promise<void> {
    const { tx, orderId, fillPrice, fillQty } = args;

    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) return;

    const proceeds = fillPrice * fillQty;
    const newFilledQty = order.filledQty + fillQty;
    const isFullyFilled = newFilledQty >= order.qty;

    await tx.tradingBalance.upsert({
        where: { userId: order.userId },
        update: {
            available: { increment: proceeds }
        },
        create: {
            userId: order.userId,
            available: proceeds,
            locked: 0n
        }
    });

    await tx.order.update({
        where: { id: orderId },
        data: {
            filledQty: newFilledQty,
            status: isFullyFilled ? "FILLED" : "PARTIALLY_FILLED",
        },
    });
}

export async function markOrderOpen(args: ReleaseOrConsumeArgs): Promise<void> {
    const { prisma, orderId } = args;

    await prisma.order.updateMany({
        where: {
            id: orderId,
            status: "PENDING",
        },
        data: {
            status: "OPEN",
        },
    });
}

export type CreateOpenOrderArgs = {
    prisma: PrismaClient | Prisma.TransactionClient;
    orderId: string;
    userId: string;
    market: string;
    side: OrderSide;
    price: bigint;
    qty: bigint;
};

export async function ensureOpenOrder(args: CreateOpenOrderArgs): Promise<void> {
    const { prisma, orderId, userId, market, side, price, qty } = args;

    const existing = await prisma.order.findUnique({
        where: { id: orderId },
        select: { id: true, status: true },
    });

    if (existing) {
        if (existing.status === "PENDING") {
            await prisma.order.update({
                where: { id: orderId },
                data: { status: "OPEN" },
            });
        }
        return;
    }

    await prisma.order.create({
        data: {
            id: orderId,
            userId,
            market,
            side,
            price,
            qty,
            filledQty: 0n,
            lockedAmount: 0n,
            consumedLocked: 0n,
            commandId: `direct-${orderId}`,
            status: "OPEN",
        },
    });
}

export async function lockBalanceForMarketOrder(args: LockMarketOrderArgs): Promise<void> {
    const { prisma, userId, orderId, commandId, market, side, qty } = args;

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.tradingBalance.upsert({
            where: { userId },
            update: {},
            create: { userId, available: 0n, locked: 0n },
        });

        await tx.$queryRaw`SELECT id FROM "TradingBalance" WHERE "userId" = ${userId} FOR UPDATE`;

        if (side === "SELL") {
            const asset = assetFromMarket(market);
            await lockAssetForSell(tx, userId, market, asset, qty);
        }

        let lockedAmount = 0n;

        if (side === "BUY") {
            const balance = await tx.tradingBalance.findUnique({ where: { userId } });
            const available = balance?.available ?? 0n;

            if (available === 0n) {
                throw new InsufficientBalanceError("No available balance for market buy order");
            }

            lockedAmount = available;

            await tx.tradingBalance.update({
                where: { userId },
                data: {
                    available: { decrement: lockedAmount },
                    locked: { increment: lockedAmount },
                },
            });
        }

        await tx.order.create({
            data: {
                id: orderId,
                userId,
                commandId,
                market,
                side,
                price: 0n,
                qty,
                filledQty: 0n,
                lockedAmount,
                consumedLocked: 0n,
                orderType: "MARKET",
                status: "PENDING",
            },
        });
    });
}

export async function creditTradingBalance(args: CreditBalanceArgs): Promise<void> {
    const { prisma, userId, amountInPaise } = args;

    await prisma.tradingBalance.upsert({
        where: { userId },
        update: { available: { increment: amountInPaise } },
        create: { userId, available: amountInPaise, locked: 0n },
    });
}

export async function debitTradingBalance(args: DebitBalanceArgs): Promise<void> {
    const { prisma, userId, amountInPaise } = args;

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.$queryRaw`
      SELECT id FROM "TradingBalance"
      WHERE "userId" = ${userId}
      FOR UPDATE
    `;

        const balance = await tx.tradingBalance.findUnique({ where: { userId } });

        if (!balance || balance.available < amountInPaise) {
            throw new InsufficientBalanceError(
                `Insufficient balance: available=${balance?.available ?? 0n} required=${amountInPaise}`
            );
        }

        await tx.tradingBalance.update({
            where: { userId },
            data: { available: { decrement: amountInPaise } },
        });
    });
}

export class InsufficientBalanceError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InsufficientBalanceError";
    }
}
