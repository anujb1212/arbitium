import { RedisManager } from "@arbitium/ts-engine-client";
import { runEngineForMarket } from "./runtime/runEngineForMarket";
import type { MarketConfig } from "./runtime/types";
import "dotenv/config"
import { acquireMarketLock, generateInstanceId, releaseMarketLock, startLockHeartbeat } from "./distributed/marketLock";

const REDIS_URL = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";

const MARKET_IDS = (process.env.MARKETS ?? "TATA-INR").split(",").map((m) => m.trim());

const MARKETS: MarketConfig[] = MARKET_IDS.map((market) => ({
    market,
    commandStreamKey: `arbitium:cmd:${market}`,
    eventStreamKey: `arbitium:evt:${market}`,
    consumerGroupName: `engine:${market}`,
    consumerName: "engine-1",
}));

async function main(): Promise<void> {
    const redisManager = new RedisManager(REDIS_URL);
    await redisManager.connect();

    const client = redisManager.getClient();
    const instanceId = generateInstanceId();

    for (const config of MARKETS) {
        const acquired = await acquireMarketLock({ client, market: config.market, instanceId });
        if (!acquired) {
            console.error(
                `[engine lock] failed to acquire lock for market=${config.market} instance=${instanceId} — another engine instance is running. Exiting.`
            );
            await redisManager.close();
            process.exit(1);
        }
        console.log(`[engine lock] acquired market=${config.market} instance=${instanceId}`);
    }

    const abortController = new AbortController();

    const heartbeatTimers = MARKETS.map((config) =>
        startLockHeartbeat({
            client,
            market: config.market,
            instanceId,
            onHeartbeatFailed: (market) => {
                console.error(`[engine lock] lost lock for market=${market} — shutting down`);
                abortController.abort();
            },
        })
    );

    process.on("SIGINT", () => abortController.abort());
    process.on("SIGTERM", () => abortController.abort());

    await Promise.all(
        MARKETS.map((config) =>
            runEngineForMarket({ client, config }, abortController.signal)
        )
    );

    for (const timer of heartbeatTimers) {
        clearInterval(timer);
    }
    for (const config of MARKETS) {
        await releaseMarketLock({ client, market: config.market, instanceId });
    }

    await redisManager.close();
}

main().catch((error) => {
    console.error("Engine fatal error:", error);
    process.exit(1);
});
