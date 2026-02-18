import { RedisManager } from "@arbitium/ts-engine-client";
import { runEngineForMarket } from "./runtime/runEngineForMarket";
import type { MarketConfig } from "./runtime/types";

const REDIS_URL = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";

const MARKETS: MarketConfig[] = [
    {
        market: "TATA-INR",
        commandStreamKey: "arbitium:cmd:TATA-INR",
        eventStreamKey: "arbitium:evt:TATA-INR",
        consumerGroupName: "engine:TATA-INR",
        consumerName: "engine-1"
    }
];

async function main(): Promise<void> {
    const redisManager = new RedisManager(REDIS_URL);
    await redisManager.connect();

    const abortController = new AbortController();

    process.on("SIGINT", () => abortController.abort());
    process.on("SIGTERM", () => abortController.abort());

    await Promise.all(
        MARKETS.map((config) =>
            runEngineForMarket({ client: redisManager.getClient(), config }, abortController.signal)
        )
    );

    await redisManager.close();
}

main().catch((error) => {
    console.error("Engine fatal error:", error);
    process.exit(1);
});
