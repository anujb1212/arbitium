import { RedisClient } from "../redis/types";
import { requiredIntegerInRange } from "./limits";
import { parseStreamReadReply } from "./replyParsing";
import { StreamMessage } from "./types";

export async function readFromConsumerGroup(params: {
    client: RedisClient,
    streamKey: string,
    groupName: string,
    consumerName: string,
    count: number,
    blockMs: number
}): Promise<StreamMessage[]> {
    const { client, streamKey, groupName, consumerName } = params

    const count = requiredIntegerInRange({
        value: params.count,
        name: "COUNT",
        min: 1,
        max: 1000
    });

    const blockMs = requiredIntegerInRange({
        value: params.blockMs,
        name: "BLOCK_MS",
        min: 0,
        max: 60_000
    })

    const reply = await client.sendCommand([
        "XREADGROUP",
        "GROUP",
        groupName,
        consumerName,
        "COUNT",
        String(count),
        "BLOCK",
        String(blockMs),
        "STREAMS",
        streamKey,
        ">"
    ])

    return parseStreamReadReply(reply)
}