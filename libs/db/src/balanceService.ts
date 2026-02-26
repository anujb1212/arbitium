import { Prisma, PrismaClient } from "@prisma/client/extension";
import { OrderSide } from "../generated/prisma";


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

export type ReleaseOrConsumeArgs = {
    prisma: PrismaClient;
    orderId: string;
};

export type CreditBalanceArgs = {
    prisma: PrismaClient;
    userId: string;
    amountInPaise: bigint;
};

export type DebitBalanceArgs = {
    prisma: PrismaClient;
    userId: string;
    amountInPaise: bigint;
};

export type PartialConsumeArgs = {
    prisma: PrismaClient;
    orderId: string;
    filledQty: bigint;
    fillPrice: bigint;
};

function computeLockedAmount(side: OrderSide, price: bigint, qty: bigint): bigint {
    return price * qty;
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
                status: "OPEN",
            },
        });
    });
}

export async function releaseLockForOrder(args: ReleaseOrConsumeArgs): Promise<void> {
    const { prisma, orderId } = args;

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const order = await tx.order.findUnique({ where: { id: orderId } });
        if (!order) return;

        const remainingLocked = order.lockedAmount - (order.price * order.filledQty);

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

export async function consumeLockOnFill(args: PartialConsumeArgs): Promise<void> {
    const { prisma, orderId, filledQty, fillPrice } = args;

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const order = await tx.order.findUnique({ where: { id: orderId } });
        if (!order) return;

        const fillCost = fillPrice * filledQty;
        const newFilledQty = order.filledQty + filledQty;
        const isFullyFilled = newFilledQty >= order.qty;

        await tx.tradingBalance.update({
            where: { userId: order.userId },
            data: {
                locked: { decrement: fillCost },
            },
        });

        await tx.order.update({
            where: { id: orderId },
            data: {
                filledQty: newFilledQty,
                status: isFullyFilled ? "FILLED" : "PARTIALLY_FILLED",
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
