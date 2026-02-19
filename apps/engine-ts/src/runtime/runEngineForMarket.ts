import { OrderBook } from "@arbitium/ts-shared/orderbook";
import {
    ensureConsumerGroup,
    readFromConsumerGroup,
    appendToStream,
    acknowledgeMessage
} from "@arbitium/ts-engine-client";
import { decodeCommandFromStreamFields, encodeEventToStreamFields } from "@arbitium/ts-shared/engine/wireCodec";
import { applyCommandToOrderBook } from "./commandHandling";
import type { EngineContext } from "./types";

const READ_COUNT = 10;
const BLOCK_MS = 2000;

export async function runEngineForMarket(
    context: EngineContext,
    signal: AbortSignal
): Promise<void> {
    const { client, config } = context;

    await ensureConsumerGroup({
        client,
        streamKey: config.commandStreamKey,
        groupName: config.consumerGroupName,
        startId: "0-0"
    });

    const orderBook = new OrderBook(config.market);
    let bookSeq = 0n;

    while (!signal.aborted) {
        const messages = await readFromConsumerGroup({
            client,
            streamKey: config.commandStreamKey,
            groupName: config.consumerGroupName,
            consumerName: config.consumerName,
            count: READ_COUNT,
            blockMs: BLOCK_MS,
            lastId: ">"
        });

        for (const message of messages) {
            const decoded = decodeCommandFromStreamFields(message.fields);

            if (!decoded.accepted) {
                await acknowledgeMessage({
                    client,
                    streamKey: config.commandStreamKey,
                    groupName: config.consumerGroupName,
                    messageId: message.id
                });
                continue;
            }

            const { events, nextBookSeq } = applyCommandToOrderBook({
                orderBook,
                command: decoded.value,
                bookSeq
            })

            let lastEventId: string | null = null

            for (const event of events) {
                lastEventId = await appendToStream({
                    client,
                    streamKey: config.eventStreamKey,
                    fields: encodeEventToStreamFields(event)
                });
            }

            if (lastEventId !== null) {
                await client.sendCommand(["PUBLISH", `evtPing:${config.market}`, lastEventId])
            }

            bookSeq = nextBookSeq;

            await acknowledgeMessage({
                client,
                streamKey: config.commandStreamKey,
                groupName: config.consumerGroupName,
                messageId: message.id
            });
        }
    }
}
