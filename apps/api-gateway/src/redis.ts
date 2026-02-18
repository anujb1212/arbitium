import { RedisManager } from "@arbitium/ts-engine-client";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379"

const redisManager = new RedisManager(REDIS_URL)

export async function connectRedis(): Promise<void> {
    await redisManager.connect()
}

export function getRedisClient() {
    return redisManager.getClient()
}

export async function disconnectRedis(): Promise<void> {
    await redisManager.close()
}