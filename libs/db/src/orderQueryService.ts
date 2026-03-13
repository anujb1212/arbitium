import type { PrismaClient } from "../generated/prisma";

export interface FillDTO {
    id: string;
    market: string;
    side: "BUY" | "SELL";
    price: string;
    qty: string;
    role: "MAKER" | "TAKER";
    executedAtMs: number;
}

export interface OrderHistoryDTO {
    orderId: string;
    market: string;
    side: "BUY" | "SELL";
    price: string;
    qty: string;
    filledQty: string;
    status: string;
    createdAtMs: number;
}

export async function queryFillsByUserAndMarket({
    prisma,
    userId,
    market,
    limit = 100,
}: {
    prisma: PrismaClient;
    userId: string;
    market: string;
    limit?: number;
}): Promise<FillDTO[]> {
    const trades = await prisma.trade.findMany({
        where: {
            market,
            OR: [
                { makerOrder: { userId } },
                { takerOrder: { userId } },
            ],
        },
        include: {
            makerOrder: { select: { userId: true, side: true } },
            takerOrder: { select: { userId: true, side: true } },
        },
        orderBy: { executedAt: "desc" },
        take: limit,
    });

    return trades.map((trade) => {
        const isMaker = trade.makerOrder.userId === userId;
        return {
            id: trade.id,
            market: trade.market,
            side: isMaker ? trade.makerOrder.side : trade.takerOrder.side,
            price: trade.price.toString(),
            qty: trade.qty.toString(),
            role: isMaker ? "MAKER" : "TAKER",
            executedAtMs: trade.executedAt.getTime(),
        };
    });
}

export async function queryOrderHistoryByUserAndMarket({
    prisma,
    userId,
    market,
    limit = 100,
}: {
    prisma: PrismaClient;
    userId: string;
    market: string;
    limit?: number;
}): Promise<OrderHistoryDTO[]> {
    const orders = await prisma.order.findMany({
        where: { userId, market },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
            id: true,
            market: true,
            side: true,
            price: true,
            qty: true,
            filledQty: true,
            status: true,
            createdAt: true,
        },
    });

    return orders.map((order) => ({
        orderId: order.id,
        market: order.market,
        side: order.side,
        price: order.price.toString(),
        qty: order.qty.toString(),
        filledQty: order.filledQty.toString(),
        status: order.status,
        createdAtMs: order.createdAt.getTime(),
    }));
}
