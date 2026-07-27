import type { EventEnvelope } from "@arbitium/ts-shared/engine/types";
import { prisma, consumeLockOnFill, creditFillProceeds, releaseLockForOrder, KlineInterval, getOpenTime, getCloseTime, upsertKline, settleMarketOrder, ensureOpenOrder } from "@arbitium/db";

let cachedSystemDbUserId: string | null = null;

async function resolveSystemDbUserId(): Promise<string> {
    if (cachedSystemDbUserId) return cachedSystemDbUserId;
    const vaultlyId = process.env.MM_VAULTLY_USER_ID;
    if (!vaultlyId) return "system";
    const user = await prisma.user.findUnique({
        where: { vaultlyUserId: vaultlyId },
        select: { id: true },
    });
    if (!user) return "system";
    cachedSystemDbUserId = user.id;
    return user.id;
}

function isPrismaUniqueViolation(error: unknown): boolean {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code: string }).code === "P2002"
    )
}

function isPrismaForeignKeyViolation(error: unknown): boolean {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code: string }).code === "P2003"
    )
}

export async function handleEvent(event: EventEnvelope): Promise<void> {
    switch (event.kind) {
        case "TRADE":
            await handleTrade(event);
            break;
        case "BOOK_DELTA":
            await handleBookDelta(event);
            break;
        case "COMMAND_REJECTED":
            await handleCommandRejected(event);
            break;
    }
}

const ALL_INTERVALS = [
    KlineInterval.ONE_MINUTE,
    KlineInterval.FIVE_MINUTES,
    KlineInterval.FIFTEEN_MINUTES,
    KlineInterval.ONE_HOUR,
    KlineInterval.ONE_DAY,
] as const;

async function ensureOrdersExist(
    tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
    orderIds: string[],
): Promise<void> {
    const sysUserId = await resolveSystemDbUserId();
    for (const orderId of orderIds) {
        await ensureOpenOrderContent(tx, orderId, sysUserId);
    }
}

async function ensureOpenOrderContent(
    tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
    orderId: string,
    userId: string,
): Promise<void> {
    const exists = await tx.order.findUnique({
        where: { id: orderId },
        select: { id: true },
    });
    if (exists) return;

    try {
        await tx.order.create({
            data: {
                id: orderId,
                userId,
                market: "UNKNOWN",
                side: "BUY",
                price: 0n,
                qty: 0n,
                filledQty: 0n,
                lockedAmount: 0n,
                consumedLocked: 0n,
                commandId: `evt-${orderId}`,
                status: "FILLED",
            },
        });
    } catch (e: unknown) {
        if (isPrismaUniqueViolation(e)) return;
        throw e;
    }
}

async function handleTrade(
    event: Extract<EventEnvelope, { kind: "TRADE" }>
): Promise<void> {
    const { makerOrderId, takerOrderId, price, qty, takerSide } = event.payload;
    const executedAt = new Date(event.payload.executedAtMs);
    const market = event.market;
    const bigPrice = BigInt(price);
    const bigQty = BigInt(qty);

    const buyOrderId = takerSide === "BUY" ? takerOrderId : makerOrderId;
    const sellOrderId = takerSide === "SELL" ? takerOrderId : makerOrderId;

    try {
        await prisma.$transaction(async (tx) => {
            await ensureOrdersExist(tx, [makerOrderId, takerOrderId]);

            try {
                await tx.trade.create({
                    data: {
                        market,
                        makerOrderId,
                        takerOrderId,
                        price: bigPrice,
                        qty: bigQty,
                        takerSide,
                        executedAt,
                    },
                });
            } catch (e: unknown) {
                if (isPrismaUniqueViolation(e)) return;
                throw e;
            }

            await consumeLockOnFill({ tx, orderId: buyOrderId, filledQty: qty, fillPrice: price });
            await consumeLockOnFill({ tx, orderId: sellOrderId, filledQty: qty, fillPrice: price });
            await creditFillProceeds({ tx, orderId: sellOrderId, fillPrice: price, fillQty: qty });

            for (const interval of ALL_INTERVALS) {
                const openTime = getOpenTime(executedAt, interval);
                const closeTime = getCloseTime(openTime, interval);
                await upsertKline({
                    tx,
                    market,
                    interval,
                    openTime,
                    closeTime,
                    tradePrice: bigPrice,
                    tradeQty: bigQty,
                });
            }
        });
    } catch (error: unknown) {
        if (isPrismaForeignKeyViolation(error)) return;
        throw error;
    }
}

async function handleBookDelta(
    event: Extract<EventEnvelope, { kind: "BOOK_DELTA" }>
): Promise<void> {
    if (event.payload.type === "MARKET_ORDER_SETTLED") {
        await settleMarketOrder({ prisma, orderId: event.payload.orderId });
        return;
    }

    if (event.payload.type === "ADD") {
        const sysUserId = await resolveSystemDbUserId();
        await ensureOpenOrder({
            prisma,
            orderId: event.payload.orderId,
            userId: sysUserId,
            market: event.market,
            side: event.payload.side as "BUY" | "SELL",
            price: BigInt(event.payload.price),
            qty: BigInt(event.payload.qty),
        });
        return;
    }

    if (event.payload.type === "CANCEL") {
        try {
            await releaseLockForOrder({ prisma, orderId: event.payload.orderId });
        } catch (e: unknown) {
            if (isPrismaForeignKeyViolation(e)) return;
            throw e;
        }
        return;
    }
}

async function handleCommandRejected(
    event: Extract<EventEnvelope, { kind: "COMMAND_REJECTED" }>
): Promise<void> {
    if (!event.commandId) return;
    if (event.payload.commandKind !== "PLACE_LIMIT" && event.payload.commandKind !== "PLACE_MARKET") return;

    await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
            where: { commandId: event.commandId },
            select: { id: true, status: true },
        });
        if (!order) return;

        if (order.status === "OPEN" || order.status === "PARTIALLY_FILLED") return;
        if (order.status === "CANCELLED" || order.status === "FILLED" || order.status === "REJECTED") return;

        await releaseLockForOrder({ prisma: tx, orderId: order.id });
        await tx.order.update({
            where: { id: order.id },
            data: { status: "REJECTED" },
        });
    });
}
