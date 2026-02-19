import { createClient } from "redis";
import { RedisManager } from "@arbitium/ts-engine-client/redis/RedisManager";
import type { RedisClient } from "@arbitium/ts-engine-client/redis/types";

export type PubSubClient = {
    subscribe(
        channel: string | string[],
        listener: (messsage: string,
            channel: string,
            bufferMode?: boolean
        ) => void
    ): Promise<void>
    unsubscribe(channel: string): Promise<void>
}

let commandManager: RedisManager | null = null
let pubSubClient: ReturnType<typeof createClient> | null = null

export async function connectRedis(redisUrl: string): Promise<void> {
    try {
        commandManager = new RedisManager(redisUrl);
        await commandManager.connect();

        pubSubClient = createClient({ url: redisUrl });
        pubSubClient.on("error", (err) => console.error("[Redis:pubsub] error:", err))
    } catch (err) {
        commandManager = null
        pubSubClient = null
        throw new Error(`Redis connection failed (${redisUrl}): ${err}`)
    }
}

export function getCommandClient(): RedisClient {
    if (!commandManager) throw new Error("Redis command client not connected");
    return commandManager.getClient();
}

export function getPubSubClient(): PubSubClient {
    if (!pubSubClient) throw new Error("Redis pubsub client not connected");
    return pubSubClient as unknown as PubSubClient;
}

export async function disconnectRedis(): Promise<void> {
    await commandManager?.close();
    await pubSubClient?.quit();
}