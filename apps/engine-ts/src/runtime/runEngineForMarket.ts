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
        startId: "0-0"   // on restart, re-process any unacked pending first
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
                // Malformed stream message: ack and skip (do not poison the queue)
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
            });

            // XADD all events before XACK — if crash here, command re-processes (idempotent via seq)
            for (const event of events) {
                await appendToStream({
                    client,
                    streamKey: config.eventStreamKey,
                    fields: encodeEventToStreamFields(event)
                });
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
