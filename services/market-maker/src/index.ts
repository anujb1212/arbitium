import { randomUUID } from "crypto";
import { API_URL, BATCH_SIZE, HALF_SPREAD, LEVELS, MARKETS, QTY_PER_LEVEL, REFRESH_INTERVAL_MS, SPREAD_TICKS, getMidPrice } from "./config";
import { cancelOrder, placeLimitOrder } from "./httpClient";

type PendingOrder = {
    orderId: string;
    market: string;
};

type LevelOrder = {
    side: "BUY" | "SELL";
    price: bigint;
    qty: bigint;
    orderId: string;
    market: string;
};

const activeOrdersByMarket = new Map<string, PendingOrder[]>();

function chunk<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}

function buildLevels(market: string, midPrice: bigint): LevelOrder[] {
    const orders: LevelOrder[] = [];

    for (let i = 0; i < LEVELS; i++) {
        const offset = SPREAD_TICKS * BigInt(i);

        orders.push({
            side: "BUY" as const,
            price: midPrice - HALF_SPREAD - offset,
            qty: QTY_PER_LEVEL,
            orderId: randomUUID(),
            market,
        });

        orders.push({
            side: "SELL" as const,
            price: midPrice + HALF_SPREAD + offset,
            qty: QTY_PER_LEVEL,
            orderId: randomUUID(),
            market,
        });
    }

    return orders;
}

async function cancelAllForMarket(market: string): Promise<void> {
    const orders = activeOrdersByMarket.get(market) ?? [];
    await Promise.allSettled(orders.map((order) => cancelOrder(order)));
    activeOrdersByMarket.set(market, []);
}

async function placeAllForMarket(market: string, midPrice: bigint): Promise<void> {
    const levels = buildLevels(market, midPrice);
    const orders: PendingOrder[] = [];

    const results = await Promise.allSettled(
        levels.map(async (order) => {
            await placeLimitOrder({
                market: order.market,
                orderId: order.orderId,
                side: order.side,
                price: order.price,
                qty: order.qty,
            });

            orders.push({
                orderId: order.orderId,
                market: order.market,
            });
        })
    );

    activeOrdersByMarket.set(market, orders);

    const failed = results.filter((res) => res.status === "rejected");
    if (failed.length > 0) {
        console.error(`[market-maker] ${market} | ${failed.length}/${levels.length} orders failed`);
    }
}

async function refreshMarket(market: string): Promise<void> {
    const midPrice = getMidPrice(market);
    await cancelAllForMarket(market);
    await placeAllForMarket(market, midPrice);
    const orderCount = activeOrdersByMarket.get(market)?.length ?? 0;
    console.log(`[market-maker] ${market} | ${orderCount} orders | mid=${midPrice}`);
}

async function refreshAll(): Promise<void> {
    const batches = chunk(MARKETS, BATCH_SIZE);

    for (const batch of batches) {
        await Promise.allSettled(batch.map((market) => refreshMarket(market)));
    }
}

async function cancelAll(): Promise<void> {
    for (const market of MARKETS) {
        await cancelAllForMarket(market);
    }
}

async function main(): Promise<void> {
    console.log(`[market-maker] starting | markets=${MARKETS.length} api=${API_URL} batch=${BATCH_SIZE}`);

    await refreshAll();

    const interval = setInterval(() => {
        refreshAll().catch((err) => console.error("[market-maker] refresh error:", err));
    }, REFRESH_INTERVAL_MS);

    const shutdown = (): void => {
        clearInterval(interval);
        cancelAll()
            .then(() => process.exit(0))
            .catch(() => process.exit(1));
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}

main().catch((err) => {
    console.error("[market-maker] fatal:", err);
    process.exit(1);
});
