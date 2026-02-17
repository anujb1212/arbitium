import { RedisClient } from "../redis/types";
import { flattenStreamFields } from "./fieldEncoding";

export async function appendToStream(params: {
    client: RedisClient,
    streamKey: string,
    fields: ReadonlyArray<[string, string]>
}): Promise<string> {
    const { client, streamKey, fields } = params
    const flatFields = flattenStreamFields(fields)

    const reply = await client.sendCommand(["XADD", streamKey, "*", ...flatFields])
    if (typeof reply !== "string" || reply.length === 0) throw new TypeError("REDIS_REPLY_INVALID")

    return reply
}
