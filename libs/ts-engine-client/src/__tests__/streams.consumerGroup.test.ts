import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { RedisManager } from "../redis/RedisManager";
import { ensureConsumerGroup } from "../streams/ensureConsumerGroup";
import { appendToStream } from "../streams/appendToStream";
import { readFromConsumerGroup } from "../streams/readFromConsumerGroup";
import { acknowledgeMessage } from "../streams/acknowledgeMessage";

import { encodeCommandToStreamFields, decodeCommandFromStreamFields } from "@arbitium/ts-shared/engine/wireCodec"
import type { CommandEnvelope } from "@arbitium/ts-shared/engine/types";
import { makeUniqueKey, parsePendingCountFromSummaryReply } from "./helpers";

describe("Streams consumer group", () => {
    const redisUrl = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";
    const redisManager = new RedisManager(redisUrl);

    beforeAll(async () => {
        try {
            await redisManager.connect();
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Set REDIS_URL or start local Redis. Cause: ${message}`);
        }
    });

    afterAll(async () => {
        await redisManager.close();
    });

    it("append => read from group => decode => ack", async () => {
        const client = redisManager.getClient();
        const streamKey = makeUniqueKey("arbitium:test:cmd");
        const groupName = "engine:TEST";
        const consumerName = makeUniqueKey("consumer");

        await ensureConsumerGroup({ client, streamKey, groupName, startId: "$" });

        const command: CommandEnvelope = {
            market: "TATA-INR",
            kind: "PLACE_LIMIT",
            commandId: "cmd-1",
            payload: { orderId: "order-1", side: "BUY", price: 1000n, qty: 2n }
        };

        await appendToStream({ client, streamKey, fields: encodeCommandToStreamFields(command) });

        try {
            const messages = await readFromConsumerGroup({
                client,
                streamKey,
                groupName,
                consumerName,
                count: 10,
                blockMs: 250
            });

            expect(messages.length).toBe(1);

            const decoded = decodeCommandFromStreamFields(messages[0]!.fields);
            expect(decoded.accepted).toBe(true);

            const acked = await acknowledgeMessage({
                client,
                streamKey,
                groupName,
                messageId: messages[0]!.id
            });

            expect(acked).toBe(1);
        } finally {
            await client.sendCommand(["DEL", streamKey]);
        }
    });

    it("read without ack => pending exists => ack clears pending", async () => {
        const client = redisManager.getClient();
        const streamKey = makeUniqueKey("arbitium:test:cmd");
        const groupName = "engine:TEST";
        const consumerName = makeUniqueKey("consumer");

        await ensureConsumerGroup({ client, streamKey, groupName, startId: "$" });

        const command: CommandEnvelope = {
            market: "TATA-INR",
            kind: "CANCEL",
            commandId: "cmd-2",
            payload: { orderId: "order-2" }
        };

        await appendToStream({ client, streamKey, fields: encodeCommandToStreamFields(command) });

        try {
            const messages = await readFromConsumerGroup({
                client,
                streamKey,
                groupName,
                consumerName,
                count: 10,
                blockMs: 250
            });

            expect(messages.length).toBe(1);

            const pendingBefore = await client.sendCommand(["XPENDING", streamKey, groupName]);
            expect(parsePendingCountFromSummaryReply(pendingBefore)).toBeGreaterThan(0);

            const acked = await acknowledgeMessage({
                client,
                streamKey,
                groupName,
                messageId: messages[0]!.id
            });
            expect(acked).toBe(1);

            const pendingAfter = await client.sendCommand(["XPENDING", streamKey, groupName]);
            expect(parsePendingCountFromSummaryReply(pendingAfter)).toBe(0);
        } finally {
            await client.sendCommand(["DEL", streamKey]);
        }
    });
});
