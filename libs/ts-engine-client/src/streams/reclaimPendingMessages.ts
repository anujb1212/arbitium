import { RedisClient } from "../redis/types";
import { requiredIntegerInRange } from "./limits";
import { parseRawStreamEntries } from "./replyParsing";
import { StreamMessage } from "./types";

export type ReclaimResult = {
    nextStartId: string;
    messages: StreamMessage[];
};

export async function reclaimPendingMessages(params: {
    client: RedisClient;
    streamKey: string;
    groupName: string;
    consumerName: string;
    minIdleMs: number;
    count: number;
    startId?: string;
}): Promise<ReclaimResult> {
    const { client, streamKey, groupName, consumerName } = params;
    const startId = params.startId ?? "0-0";

    const count = requiredIntegerInRange({
        value: params.count,
        name: "COUNT",
        min: 1,
        max: 1000,
    });

    const minIdleMs = requiredIntegerInRange({
        value: params.minIdleMs,
        name: "MIN_IDLE_MS",
        min: 0,
        max: 3_600_000,
    });

    const reply = await client.sendCommand([
        "XAUTOCLAIM",
        streamKey,
        groupName,
        consumerName,
        String(minIdleMs),
        startId,
        "COUNT",
        String(count),
    ]) as [string, unknown, unknown];

    const nextStartId = reply[0] as string;
    const messages = parseRawStreamEntries(reply[1]);

    return { nextStartId, messages };
}
