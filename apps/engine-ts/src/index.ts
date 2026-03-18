import { RedisManager } from "@arbitium/ts-engine-client";
import { runEngineForMarket } from "./runtime/runEngineForMarket";
import type { MarketConfig } from "./runtime/types";
import "dotenv/config"
import {
    acquireMarketLock,
    generateInstanceId,
    releaseMarketLock,
    startLockHeartbeat
} from "./distributed/marketLock";

const REDIS_URL = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";
const MARKET_IDS = (process.env.MARKETS ?? "TATA-INR").split(",").map((m) => m.trim());

async function main(): Promise<void> {
    const redisManagers: RedisManager[] = []

    for (let i = 0; i < MARKET_IDS.length; i++) {
        const manager = new RedisManager(REDIS_URL)
        await manager.connect()
        redisManagers.push(manager)
    }

    const lockClient = redisManagers[0]!.getClient()
    const instanceId = generateInstanceId()

    const MARKETS: MarketConfig[] = MARKET_IDS.map((market, index) => ({
        market,
        commandStreamKey: `arbitium:cmd:${market}`,
        eventStreamKey: `arbitium:evt:${market}`,
        consumerGroupName: `engine:${market}`,
        consumerName: `engine-${instanceId}`,
        client: redisManagers[index]!.getClient()
    }))

    const acquiredMarkets: string[] = []

    for (const config of MARKETS) {
        const acquired = await acquireMarketLock({
            client: lockClient,
            market: config.market,
            instanceId
        })

        if (!acquired) {
            console.error(
                `[engine lock] failed to acquire lock for market=${config.market} instance=${instanceId} — another engine instance is running. Exiting.`
            )

            for (const lockedMarket of acquiredMarkets) {
                await releaseMarketLock({
                    client: lockClient,
                    market: lockedMarket,
                    instanceId
                }).catch(console.error)
            }

            await Promise.all(redisManagers.map((m) => m.close()))
            process.exit(1)
        }

        acquiredMarkets.push(config.market)
        console.log(`[engine lock] acquired market=${config.market} instance=${instanceId}`)
    }

    const abortController = new AbortController()

    const heartbeatTimers = MARKETS.map((config) =>
        startLockHeartbeat({
            client: lockClient,
            market: config.market,
            instanceId,
            onHeartbeatFailed: (market) => {
                console.error(`[engine lock] lost lock for market=${market} — shutting down`)
                abortController.abort()
            },
        })
    )

    process.on("SIGINT", () => abortController.abort())
    process.on("SIGTERM", () => abortController.abort())

    await Promise.all(
        MARKETS.map((config) =>
            runEngineForMarket({ client: config.client, config }, abortController.signal)
        )
    )

    for (const timer of heartbeatTimers) {
        clearInterval(timer)
    }

    for (const config of MARKETS) {
        await releaseMarketLock({ client: lockClient, market: config.market, instanceId })
    }

    await Promise.all(redisManagers.map((m) => m.close()))
}

main().catch((error) => {
    console.error("Engine fatal error:", error)
    process.exit(1)
})
