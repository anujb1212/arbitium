import { RedisManager } from "@arbitium/ts-engine-client/redis/RedisManager";
import { ensureConsumerGroup } from "@arbitium/ts-engine-client/streams/ensureConsumerGroup";
import { readFromConsumerGroup } from "@arbitium/ts-engine-client/streams/readFromConsumerGroup";
import { acknowledgeMessage } from "@arbitium/ts-engine-client/streams/acknowledgeMessage";
import { decodeEventFromStreamFields } from "@arbitium/ts-shared/engine/wire/eventCodec";
import { handleEvent } from "./eventHandler";
import { reclaimPendingMessages } from "@arbitium/ts-engine-client/streams/reclaimPendingMessages";
import { createServer } from "http";
import { prisma } from "@arbitium/db";

const REDIS_URL = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";
const MARKETS = (process.env.MARKETS ?? "TATA-INR,RELIANCE-INR,INFY-INR").split(",");
const CONSUMER_GROUP = "db";
const CONSUMER_NAME = `data-service-${process.pid}`;
const STREAM_PREFIX = "arbitium:evt:";
const POLL_BLOCK_MS = 200;
const PEL_IDLE_MS = 30_000;
const PEL_BATCH_SIZE = 50;
const HEALTH_PORT = Number(process.env.HEALTH_PORT ?? "8082");

function startHealthServer(
    redisClient: ReturnType<InstanceType<typeof RedisManager>["getClient"]>
): ReturnType<typeof createServer> {
    const server = createServer(async (req, res) => {
        if (req.url !== "/healthz") {
            res.writeHead(404).end();
            return;
        }
        try {
            await redisClient.sendCommand(["PING"]);
            await prisma.$queryRaw`SELECT 1`;
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ status: "ok" }));
        } catch (error) {
            console.error("[healthz] check failed:", error);
            res.writeHead(503, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ status: "degraded" }));
        }
    });
    server.listen(HEALTH_PORT, () => {
        console.log(`[data-service] Health check on :${HEALTH_PORT}`);
    });
    return server;
}

async function drainPendingMessages(
    client: ReturnType<InstanceType<typeof RedisManager>["getClient"]>,
    streamKey: string
): Promise<void> {
    let startId = "0-0";

    while (true) {
        const { nextStartId, messages } = await reclaimPendingMessages({
            client,
            streamKey,
            groupName: CONSUMER_GROUP,
            consumerName: CONSUMER_NAME,
            minIdleMs: PEL_IDLE_MS,
            count: PEL_BATCH_SIZE,
            startId,
        });

        await processMessages(client, streamKey, messages);

        if (nextStartId === "0-0") break;
        startId = nextStartId;
    }
}


async function processMessages(
    client: ReturnType<InstanceType<typeof RedisManager>["getClient"]>,
    streamKey: string,
    messages: Awaited<ReturnType<typeof readFromConsumerGroup>>
): Promise<void> {
    for (const message of messages) {
        const decoded = decodeEventFromStreamFields(message.fields);

        if (!decoded.accepted) {
            console.error(`Malformed event ${message.id}: ${decoded.rejectReason}`);
            await acknowledgeMessage({ client, streamKey, groupName: CONSUMER_GROUP, messageId: message.id });
            continue;
        }

        try {
            await handleEvent(decoded.value);
            await acknowledgeMessage({ client, streamKey, groupName: CONSUMER_GROUP, messageId: message.id });
        } catch (error) {
            console.error(`Failed to handle event ${message.id}:`, error);
        }
    }
}

async function runMarketConsumerLoop(
    client: ReturnType<InstanceType<typeof RedisManager>["getClient"]>,
    streamKey: string,
    abortSignal: AbortSignal
): Promise<void> {
    while (!abortSignal.aborted) {
        const messages = await readFromConsumerGroup({
            client,
            streamKey,
            groupName: CONSUMER_GROUP,
            consumerName: CONSUMER_NAME,
            count: 50,
            blockMs: POLL_BLOCK_MS,
        })
        await processMessages(client, streamKey, messages)
    }
}

async function main(): Promise<void> {
    const redisManager = new RedisManager(REDIS_URL);
    await redisManager.connect();
    const client = redisManager.getClient();
    const healthServer = startHealthServer(client);

    for (const market of MARKETS) {
        const streamKey = `${STREAM_PREFIX}${market}`;
        await ensureConsumerGroup({ client, streamKey, groupName: CONSUMER_GROUP, startId: "0-0" })
        console.log(`Consumer group ensured for market: ${market}`);

        await drainPendingMessages(client, streamKey);
        console.log(`PEL drained for market: ${market}`);
    }

    console.log("data-service started — consuming event streams");

    const abortController = new AbortController();
    const shutdown = (): void => {
        healthServer.close();
        abortController.abort();
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

    await Promise.all(
        MARKETS.map((market) =>
            runMarketConsumerLoop(client, `${STREAM_PREFIX}${market}`, abortController.signal)
        )
    )

    await redisManager.close();
}

main().catch((error) => {
    console.error("data-service crashed:", error);
    process.exit(1);
});
