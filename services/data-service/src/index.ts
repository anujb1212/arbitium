import { RedisManager } from "@arbitium/ts-engine-client/redis/RedisManager";
import { ensureConsumerGroup } from "@arbitium/ts-engine-client/streams/ensureConsumerGroup";
import { readFromConsumerGroup } from "@arbitium/ts-engine-client/streams/readFromConsumerGroup";
import { acknowledgeMessage } from "@arbitium/ts-engine-client/streams/acknowledgeMessage";
import { decodeEventFromStreamFields } from "@arbitium/ts-shared/engine/wire/eventCodec";
import { handleEvent } from "./eventHandler";

const REDIS_URL = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";
const MARKETS = (process.env.MARKETS ?? "TATA-INR,RELIANCE-INR,INFY-INR").split(",");
const CONSUMER_GROUP = "db";
const CONSUMER_NAME = `data-service-${process.pid}`;
const STREAM_PREFIX = "arbitium:evt:";
const BLOCK_MS = 5000;

async function main(): Promise<void> {
    const redisManager = new RedisManager(REDIS_URL);
    await redisManager.connect();
    const client = redisManager.getClient();

    for (const market of MARKETS) {
        await ensureConsumerGroup({
            client,
            streamKey: `${STREAM_PREFIX}${market}`,
            groupName: CONSUMER_GROUP,
            startId: "$",  // only new events from now
        });
        console.log(`Consumer group ensured for market: ${market}`);
    }

    console.log("data-service started — consuming event streams");

    const abortController = new AbortController();
    process.on("SIGINT", () => abortController.abort());
    process.on("SIGTERM", () => abortController.abort());

    while (!abortController.signal.aborted) {
        for (const market of MARKETS) {
            const streamKey = `${STREAM_PREFIX}${market}`;

            const messages = await readFromConsumerGroup({
                client,
                streamKey,
                groupName: CONSUMER_GROUP,
                consumerName: CONSUMER_NAME,
                count: 50,
                blockMs: BLOCK_MS,
            });

            for (const message of messages) {
                const decoded = decodeEventFromStreamFields(message.fields);

                if (!decoded.accepted) {
                    // Malformed event — ACK karo taaki PEL block na kare
                    console.error(`Malformed event ${message.id}: ${decoded.rejectReason}`);
                    await acknowledgeMessage({
                        client,
                        streamKey,
                        groupName: CONSUMER_GROUP,
                        messageId: message.id,
                    });
                    continue;
                }

                try {
                    await handleEvent(decoded.value);
                    await acknowledgeMessage({
                        client,
                        streamKey,
                        groupName: CONSUMER_GROUP,
                        messageId: message.id,
                    });
                } catch (error) {
                    // Do NOT ACK — message stays in PEL for retry
                    console.error(`Failed to handle event ${message.id}:`, error);
                }
            }
        }
    }

    await redisManager.close();
}

main().catch((error) => {
    console.error("data-service crashed:", error);
    process.exit(1);
});
