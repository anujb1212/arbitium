import type { RedisClient } from "../redis/types";
import type { StreamMessage } from "./types";
import { parseStreamReadReply } from "./replyParsing";
import { requiredIntegerInRange } from "./limits";

export async function readStreamSince(params: {
    client: RedisClient;
    streamKey: string;
    fromId: string;
    count: number;
    blockMs: number;
}): Promise<StreamMessage[]> {
    const { client, streamKey, fromId } = params

    const count = requiredIntegerInRange({
        value: params.count,
        name: "COUNT",
        min: 1,
        max: 5000
    });

    const blockMs = requiredIntegerInRange({
        value: params.blockMs,
        name: "BLOCK_MS",
        min: 0,
        max: 60_000
    })

    const reply = await client.sendCommand([
        "XREAD",
        "COUNT",
        String(count),
        "BLOCK",
        String(blockMs),
        "STREAMS",
        streamKey,
        fromId
    ])

    return parseStreamReadReply(reply)
}