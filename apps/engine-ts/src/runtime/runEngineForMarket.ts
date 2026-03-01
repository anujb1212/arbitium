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

async function processMessage(params: {
    client: EngineContext["client"]
    config: EngineContext["config"]
    orderBook: OrderBook
    getBookSeq: () => bigint
    setBookSeq: (seq: bigint) => void
    message: { id: string; fields: Record<string, string> }
}): Promise<void> {
    const { client, config, orderBook, getBookSeq, setBookSeq, message } = params

    const decoded = decodeCommandFromStreamFields(message.fields)

    if (!decoded.accepted) {
        await acknowledgeMessage({
            client,
            streamKey: config.commandStreamKey,
            groupName: config.consumerGroupName,
            messageId: message.id
        })
        return
    }

    const { events, nextBookSeq } = applyCommandToOrderBook({
        orderBook,
        command: decoded.value,
        bookSeq: getBookSeq()
    })

    let lastEventId: string | null = null
    for (const event of events) {
        lastEventId = await appendToStream({
            client,
            streamKey: config.eventStreamKey,
            fields: encodeEventToStreamFields(event)
        })
    }

    if (lastEventId !== null) {
        await client.sendCommand(["PUBLISH", `evtPing:${config.market}`, lastEventId])
    }

    setBookSeq(nextBookSeq)

    await acknowledgeMessage({
        client,
        streamKey: config.commandStreamKey,
        groupName: config.consumerGroupName,
        messageId: message.id
    })
}

async function drainPendingCommands(params: {
    client: EngineContext["client"]
    config: EngineContext["config"]
    orderBook: OrderBook
    getBookSeq: () => bigint
    setBookSeq: (seq: bigint) => void
}): Promise<void> {
    const { client, config, orderBook, getBookSeq, setBookSeq } = params

    while (true) {
        const messages = await readFromConsumerGroup({
            client,
            streamKey: config.commandStreamKey,
            groupName: config.consumerGroupName,
            consumerName: config.consumerName,
            count: READ_COUNT,
            blockMs: 0,
            lastId: "0"
        })

        if (messages.length === 0) break

        for (const message of messages) {
            await processMessage({ client, config, orderBook, getBookSeq, setBookSeq, message })
        }
    }
}

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

    await drainPendingCommands({
        client,
        config,
        orderBook,
        getBookSeq: () => bookSeq,
        setBookSeq: (seq) => { bookSeq = seq }
    })

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
            await processMessage({
                client,
                config,
                orderBook,
                getBookSeq: () => bookSeq,
                setBookSeq: (seq) => { bookSeq = seq },
                message
            })
        }
    }
}
