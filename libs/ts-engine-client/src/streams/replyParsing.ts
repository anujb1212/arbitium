import { StreamMessage } from "./types";

export function parseIntegerReply(reply: unknown): number {
    if (typeof reply === "number" && Number.isInteger(reply)) return reply

    if (typeof reply === "string") {
        const parsed = Number.parseInt(reply, 10)
        if (Number.isInteger(parsed) && String(parsed) === reply) return parsed
    }

    throw new TypeError("REDIS_REPLY_INVALID");
}

export function parseStreamReadReply(reply: unknown): StreamMessage[] {
    if (reply === null || reply === undefined) return []
    if (!Array.isArray(reply)) throw new TypeError("REDIS_REPLY_INVALID")
    if (reply.length === 0) return []

    const messages: StreamMessage[] = []

    for (const streamPart of reply) {
        if (!Array.isArray(streamPart) || streamPart.length !== 2) throw new TypeError("REDIS_REPLY_INVALID")

        const entries = streamPart[1]
        if (!Array.isArray(entries)) throw new TypeError("REDIS_REPLY_INVALID")

        for (const entry of entries) {
            if (!Array.isArray(entry) || entry.length !== 2) throw new TypeError("REDIS_REPLY_INVALID")

            const messageId = entry[0]
            const rawFields = entry[1]

            if (typeof messageId !== "string" || messageId.length === 0) throw new TypeError("REDIS_REPLY_INVALID")
            if (!Array.isArray(rawFields) || rawFields.length % 2 !== 0) throw new TypeError("REDIS_REPLY_INVALID")

            const fields: Record<string, string> = {}
            for (let i = 0; i < rawFields.length; i += 2) {
                const fieldKey = rawFields[i]
                const fieldValue = rawFields[i + 1]

                if (typeof fieldKey !== "string" || fieldKey.length === 0) throw new TypeError("REDIS_REPLY_INVALID")
                if (typeof fieldValue !== "string") throw new TypeError("REDIS_REPLY_INVALID")

                fields[fieldKey] = fieldValue
            }

            messages.push({
                id: messageId,
                fields
            })
        }
    }

    return messages
}
