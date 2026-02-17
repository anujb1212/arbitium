import { RedisClient } from "../redis/types";

export async function ensureConsumerGroup(params: {
    client: RedisClient,
    streamKey: string,
    groupName: string,
    startId: "0-0" | "$"
}): Promise<void> {
    const { client, streamKey, groupName, startId } = params

    try {
        await client.sendCommand(["XGROUP", "CREATE", streamKey, groupName, startId, "MKSTREAM"])
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        if (message.includes("BUSYGROUP")) return
        throw error
    }
}
