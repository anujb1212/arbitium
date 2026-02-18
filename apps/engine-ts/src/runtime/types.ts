import type { RedisClient } from "@arbitium/ts-engine-client";
import type { MarketId } from "@arbitium/ts-shared/orderbook/types";

export type MarketConfig = {
    market: MarketId;
    commandStreamKey: string;
    eventStreamKey: string;
    consumerGroupName: string;
    consumerName: string
}

export type EngineContext = {
    client: RedisClient;
    config: MarketConfig
}