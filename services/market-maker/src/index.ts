import { randomUUID } from "crypto";
import { API_URL, LEVELS, MARKET, MID_PRICE, QTY_PER_LEVEL, REFRESH_INTERVAL_MS, SPREAD_TICKS } from "./config";
import { cancelOrder, placeLimitOrder } from "./httpClient";

type PendingOrder = {
    orderId: string;
    market: string
}

type LevelOrder = {
    side: "BUY" | "SELL";
    price: bigint;
    qty: bigint;
    orderId: string
}

let activeOrders: PendingOrder[] = []

function buildLevels(): LevelOrder[] {
    const orders: LevelOrder[] = []

    for (let i = 0; i <= LEVELS; i++) {
        const offset = SPREAD_TICKS * BigInt(i)

        orders.push({
            side: "BUY" as const,
            price: MID_PRICE - offset,
            qty: QTY_PER_LEVEL,
            orderId: randomUUID()
        })

        orders.push({
            side: "SELL" as const,
            price: MID_PRICE + offset,
            qty: QTY_PER_LEVEL,
            orderId: randomUUID()
        })
    }

    return orders
}

async function cancelAll(): Promise<void> {
    await Promise.allSettled(activeOrders.map((order) => cancelOrder(order)))
    activeOrders = []
}

async function placeAll(): Promise<void> {
    const levels = buildLevels()

    await Promise.allSettled(
        levels.map(async (order) => {
            await placeLimitOrder({
                market: MARKET,
                orderId: order.orderId,
                side: order.side,
                price: order.price,
                qty: order.qty
            })

            activeOrders.push({
                orderId: order.orderId,
                market: MARKET
            })
        })
    )
}

async function refresh(): Promise<void> {
    await cancelAll()
    await placeAll()
    console.log(`[market-maker] ${MARKET} | ${activeOrders.length} orders | mid=${MID_PRICE}`)
}

async function main(): Promise<void> {
    console.log(`[market-maker] starting | market=${MARKET} api=${API_URL}`)

    await refresh()

    const interval = setInterval(() => {
        refresh().catch((err) => console.error("[market-maker] refresh error:", err))
    }, REFRESH_INTERVAL_MS)

    const shutdown = (): void => {
        clearInterval(interval)
        cancelAll()
            .then(() => process.exit(0))
            .catch(() => process.exit(1))
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}

main().catch((err) => {
    console.error("[market-maker] fatal:", err)
    process.exit(1)
})