import { createClient } from "redis";
import { RedisManager } from "@arbitium/ts-engine-client/redis/RedisManager";
import type { RedisClient } from "@arbitium/ts-engine-client/redis/types";

export type PubSubClient = {
    subscribe(
        channel: string,
        listener: (messsage: string,
            channel: string
        ) => void
    ): Promise<void>
    unsubscribe(channel: string): Promise<void>
}

let commandManager: RedisManager | null = null
let pubSubClient: ReturnType<typeof createClient> | null = null

export async function connectRedis(redisUrl: string): Promise<void> {
    const commandManager = new RedisManager(redisUrl)
    await commandManager.connect()

    pubSubClient = createClient({ url: redisUrl })
    pubSubClient.on("error", (err) => console.error("Pubsub error", err))
    await pubSubClient.connect()
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