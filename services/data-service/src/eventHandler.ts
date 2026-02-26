import type { EventEnvelope } from "@arbitium/ts-shared/engine/types";
import { prisma, consumeLockOnFill, releaseLockForOrder } from "@arbitium/db";

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

async function handleTrade(
    event: Extract<EventEnvelope, { kind: "TRADE" }>
): Promise<void> {
    const { makerOrderId, takerOrderId, price, qty } = event.payload;

    const existing = await prisma.trade.findFirst({
        where: { makerOrderId, takerOrderId, price, qty },
        select: { id: true },
    });
    if (existing) return;

    await prisma.$transaction(async (tx: typeof prisma) => {
        await tx.trade.create({
            data: { market: event.market, makerOrderId, takerOrderId, price, qty },
        });

        await consumeLockOnFill({
            prisma: tx,
            orderId: makerOrderId,
            filledQty: qty,
            fillPrice: price,
        });

        await consumeLockOnFill({
            prisma: tx,
            orderId: takerOrderId,
            filledQty: qty,
            fillPrice: price,
        });
    });
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
