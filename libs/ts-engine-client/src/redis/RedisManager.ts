import { createClient } from "redis";
import { RedisClient } from "./types";

export class RedisManager {
    private readonly client: RedisClient
    private isConnected: boolean = false

    public constructor(redisUrl: string) {
        this.client = createClient({ url: redisUrl }) as unknown as RedisClient
        this.client.on("error", (error) => {
            console.error("Redis client error: ", error)
        })
    }

    public async connect(): Promise<void> {
        await this.client.connect()
        this.isConnected = true
    }

    public async close(): Promise<void> {
        if (!this.isConnected) return
        await this.client.quit()
        this.isConnected = false
    }

    public getClient(): RedisClient {
        return this.client
    }
}