import type { RedisClient } from "../redis/types";
import { parseIntegerReply } from "./replyParsing";

export async function acknowledgeMessage(params: {
    client: RedisClient,
    streamKey: string,
    groupName: string,
    messageId: string
}): Promise<number> {
    const { client, streamKey, groupName, messageId } = params

    const reply = await client.sendCommand(["XACK", streamKey, groupName, messageId])

    return parseIntegerReply(reply)
}