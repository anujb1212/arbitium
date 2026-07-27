import type { Prisma, PrismaClient } from "../generated/prisma";
import { queryAssetBalancesByUser } from "./assetBalanceService";

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

export interface HoldingDTO {
    asset: string;
    market: string;
    availableQty: string;
    lockedQty: string;
    netQty: string;
    avgBuyPrice: string;
}

export async function queryHoldingsByUser({
    prisma,
    userId,
}: {
    prisma: PrismaClient | Prisma.TransactionClient;
    userId: string;
}): Promise<HoldingDTO[]> {
    const balances = await queryAssetBalancesByUser(prisma, userId);

    if (balances.length === 0) return [];

    const markets = balances.map((b) => b.market);

    const trades = await prisma.trade.findMany({
        where: {
            market: { in: markets },
            OR: [
                { makerOrder: { userId } },
                { takerOrder: { userId } },
            ],
        },
        include: {
            makerOrder: { select: { userId: true } },
            takerOrder: { select: { userId: true } },
        },
    });

    type Acc = { totalBuyCost: bigint; totalBuyQty: bigint };
    const buyStats = new Map<string, Acc>();

    for (const trade of trades) {
        const isTaker = trade.takerOrder.userId === userId;
        const userSide = isTaker
            ? trade.takerSide
            : trade.takerSide === "BUY" ? "SELL" : "BUY";

        if (userSide === "BUY") {
            const acc = buyStats.get(trade.market) ?? { totalBuyCost: 0n, totalBuyQty: 0n };
            acc.totalBuyCost += trade.price * trade.qty;
            acc.totalBuyQty += trade.qty;
            buyStats.set(trade.market, acc);
        }
    }

    return balances.map((b) => {
        const stats = buyStats.get(b.market);
        return {
            asset: b.asset,
            market: b.market,
            availableQty: b.available.toString(),
            lockedQty: b.locked.toString(),
            netQty: (b.available + b.locked).toString(),
            avgBuyPrice: stats && stats.totalBuyQty > 0n
                ? (stats.totalBuyCost / stats.totalBuyQty).toString()
                : "0",
        };
    });
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
