export function parsePendingCountFromSummaryReply(reply: unknown): number {
    if (!Array.isArray(reply) || reply.length < 1) throw new TypeError("REDIS_REPLY_INVALID");
    const count = reply[0];

    if (typeof count === "number" && Number.isInteger(count)) return count;

    if (typeof count === "string") {
        const parsed = Number.parseInt(count, 10);
        if (Number.isInteger(parsed) && String(parsed) === count) return parsed;
    }

    throw new TypeError("REDIS_REPLY_INVALID");
}

export function makeUniqueKey(prefix: string): string {
    const key = `${prefix}:${Date.now()}:${Math.random().toString(16).slice(2)}`
    return key
}