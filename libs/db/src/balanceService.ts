import { OrderSide, Prisma, PrismaClient } from "../generated/prisma";
import { queryHoldingsByUser } from "./orderQueryService";

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
    maxLockAmount?: bigint;
};

export type ReleaseOrConsumeArgs = {
    prisma: PrismaClient;
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

function computeLockedAmount(side: OrderSide, price: bigint, qty: bigint): bigint {
    return side === "BUY" ? price * qty : 0n;
}

export async function lockBalanceForOrder(args: LockBalanceArgs): Promise<void> {
    const { prisma, userId, orderId, commandId, market, side, price, qty } = args;

    const lockedAmount = computeLockedAmount(side, price, qty);

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

export async function releaseLockForOrder(args: ReleaseOrConsumeArgs): Promise<void> {
    const { prisma, orderId } = args;

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const order = await tx.order.findUnique({ where: { id: orderId } });
        if (!order) return;

        if (order.status === "CANCELLED" || order.status === "FILLED" || order.status === "REJECTED") return

        const remainingLocked = order.lockedAmount - order.consumedLocked;

        if (remainingLocked > 0n) {
            await tx.tradingBalance.update({
                where: { userId: order.userId },
                data: {
                    available: { increment: remainingLocked },
                    locked: { decrement: remainingLocked },
                },
            });
        }

        await tx.order.update({
            where: { id: orderId },
            data: { status: "CANCELLED" },
        });
    });
}

export async function settleMarketOrder(args: { prisma: PrismaClient; orderId: string }): Promise<void> {
    const { prisma, orderId } = args;

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const order = await tx.order.findUnique({ where: { id: orderId } });
        if (!order || order.orderType !== "MARKET") return;
        if (order.status === "CANCELLED" || order.status === "REJECTED") return;

        const remainingLocked = order.lockedAmount - order.consumedLocked;

        if (remainingLocked > 0n) {
            await tx.tradingBalance.updateMany({
                where: { userId: order.userId },
                data: {
                    available: { increment: remainingLocked },
                    locked: { decrement: remainingLocked },
                },
            });
        }

        const finalStatus = order.filledQty > 0n ? "FILLED" : "CANCELLED";
        await tx.order.update({
            where: { id: orderId },
            data: {
                status: finalStatus,
                consumedLocked: order.lockedAmount
            },
        });
    });
}

export async function consumeLockOnFill(args: ConsumeOnFillArgs): Promise<void> {
    const { tx, orderId, filledQty, fillPrice } = args;

    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) return;

    const reservedForFill = order.orderType === "MARKET"
        ? fillPrice * filledQty
        : order.price * filledQty;

    const newFilledQty = order.filledQty + filledQty;
    const isFullyFilled = newFilledQty >= order.qty

    const actualCost = fillPrice * filledQty
    const refund = reservedForFill - actualCost

    if (reservedForFill > 0n) {
        await tx.tradingBalance.updateMany({
            where: { userId: order.userId },
            data: {
                locked: { decrement: reservedForFill },
                ...(refund > 0n ? {
                    available: {
                        increment: refund
                    }
                } : {}),
            },
        });
    }

    await tx.order.update({
        where: { id: orderId },
        data: {
            filledQty: newFilledQty,
            consumedLocked: { increment: reservedForFill },
            status: isFullyFilled ? "FILLED" : "PARTIALLY_FILLED",
        },
    });
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
            available: {
                increment: proceeds
            }
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
            const holdings = await queryHoldingsByUser({ prisma: tx, userId });
            const holding = holdings.find((h) => h.market === market);
            const netQty = BigInt(holding?.netQty ?? "0");

            const openSellOrders = await tx.order.findMany({
                where: {
                    userId,
                    market,
                    side: "SELL",
                    status: { in: ["PENDING", "OPEN", "PARTIALLY_FILLED"] },
                },
                select: { qty: true, filledQty: true },
            });
            const lockedSellQty = openSellOrders.reduce(
                (sum, order) => sum + (order.qty - order.filledQty),
                0n
            );
            const availableSellQty = netQty - lockedSellQty < 0n ? 0n : netQty - lockedSellQty;

            if (qty > availableSellQty) {
                throw new InsufficientBalanceError(
                    `Insufficient holdings: available=${availableSellQty} required=${qty}`
                );
            }
        }

        const balance = await tx.tradingBalance.findUnique({ where: { userId } });
        const available = balance?.available ?? 0n;
        const lockedAmount = side === "BUY"
            ? (args.maxLockAmount !== undefined
                ? (args.maxLockAmount < available ? args.maxLockAmount : available)
                : available)
            : 0n;

        if (side === "BUY" && lockedAmount === 0n) {
            throw new InsufficientBalanceError("No available balance for market buy order");
        }

        if (side === "BUY") {
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

//Credit (deposit from Vaultly)
export async function creditTradingBalance(args: CreditBalanceArgs): Promise<void> {
    const { prisma, userId, amountInPaise } = args;

    await prisma.tradingBalance.upsert({
        where: { userId },
        update: { available: { increment: amountInPaise } },
        create: { userId, available: amountInPaise, locked: 0n },
    });
}

//Debit (withdraw to Vaultly) 
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
