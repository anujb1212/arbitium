import type { EventEnvelope } from "@arbitium/ts-shared/engine/types";
import { prisma, consumeLockOnFill, creditFillProceeds, releaseLockForOrder, KlineInterval, getOpenTime, getCloseTime, upsertKline } from "@arbitium/db";

function isPrismaUniqueViolation(error: unknown): boolean {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code: string }).code === "P2002"
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

async function handleTrade(
    event: Extract<EventEnvelope, { kind: "TRADE" }>
): Promise<void> {
    const { makerOrderId, takerOrderId, price, qty, takerSide } = event.payload;

    const buyOrderId = takerSide === "BUY" ? takerOrderId : makerOrderId;
    const sellOrderId = takerSide === "SELL" ? takerOrderId : makerOrderId;

    const tradeTime = new Date();

    try {
        await prisma.$transaction(async (tx) => {
            await tx.trade.create({
                data: { market: event.market, makerOrderId, takerOrderId, price, qty },
            });

            await consumeLockOnFill({ tx, orderId: buyOrderId, filledQty: qty, fillPrice: price });

            await creditFillProceeds({ tx, orderId: sellOrderId, fillPrice: price, fillQty: qty });

            for (const interval of ALL_INTERVALS) {
                const openTime = getOpenTime(tradeTime, interval);
                const closeTime = getCloseTime(openTime, interval);
                await upsertKline({
                    tx,
                    market: event.market,
                    interval,
                    openTime,
                    closeTime,
                    tradePrice: price,
                    tradeQty: qty
                });
            }
        });
    } catch (error: unknown) {
        if (isPrismaUniqueViolation(error)) return;
        throw error;
    }
}

async function handleBookDelta(
    event: Extract<EventEnvelope, { kind: "BOOK_DELTA" }>
): Promise<void> {
    if (event.payload.type === "CANCEL") {
        await releaseLockForOrder({
            prisma,
            orderId: event.payload.orderId,
        });
    }
}

async function handleCommandRejected(
    event: Extract<EventEnvelope, { kind: "COMMAND_REJECTED" }>
): Promise<void> {
    if (!event.commandId) return;
    if (event.payload.commandKind !== "PLACE_LIMIT") return;

    const order = await prisma.order.findUnique({
        where: { commandId: event.commandId },
        select: { id: true },
    });
    if (!order) return;

    await releaseLockForOrder({ prisma, orderId: order.id });

    await prisma.order.update({
        where: { id: order.id },
        data: { status: "REJECTED" },
    });
}
