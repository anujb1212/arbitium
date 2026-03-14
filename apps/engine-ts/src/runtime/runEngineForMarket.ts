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
import { restoreOrderBook } from "./recovery";
import { EngineSnapshot, saveSnapshot } from "../persistence/snapshotStore";

const READ_COUNT = 10;
const BLOCK_MS = 2000;
const DEPTH_SNAPSHOT_LEVELS = 20;
const SNAPSHOT_EVERY_N_COMMANDS = parseInt(
    process.env.SNAPSHOT_EVERY_N_COMMANDS ?? "500", 10
);

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

    try {
        const engineStartMs = performance.now()

        const { events, nextBookSeq } = applyCommandToOrderBook({
            orderBook,
            command: decoded.value,
            bookSeq: getBookSeq()
        })

        let lastEventId: string | null = null
        if (events.length > 0) {
            const eventIds = await Promise.all(
                events.map((event) =>
                    appendToStream({
                        client,
                        streamKey: config.eventStreamKey,
                        fields: encodeEventToStreamFields(event)
                    })
                )
            )
            lastEventId = eventIds[eventIds.length - 1] ?? null
        }

        setBookSeq(nextBookSeq)

        const depthJson = JSON.stringify(
            orderBook.getDepth(DEPTH_SNAPSHOT_LEVELS),
            (_k, v) => (typeof v === "bigint" ? v.toString() : v)
        )

        await Promise.all([
            lastEventId !== null
                ? client.sendCommand(["PUBLISH", `evtPing:${config.market}`, lastEventId])
                : Promise.resolve(),
            client.sendCommand(["SET", `arbitium:depth:${config.market}`, depthJson]),
            acknowledgeMessage({
                client,
                streamKey: config.commandStreamKey,
                groupName: config.consumerGroupName,
                messageId: message.id
            })
        ])

        const cmdWriteTs = parseInt(message.id.split("-")[0]!, 10)
        const cmdToEngineMs = Date.now() - cmdWriteTs

        if (cmdToEngineMs > 500) {
            console.warn(`[engine lag] market=${config.market} cmd→engine=${cmdToEngineMs}ms events=${events.length}`)
        }

    } catch (error) {
        console.error(`[engine] processMessage failed for ${message.id} in ${config.market}:`, error)
        await acknowledgeMessage({
            client,
            streamKey: config.commandStreamKey,
            groupName: config.consumerGroupName,
            messageId: message.id
        })
    }
}

async function replayPendingCommandMessages(params: {
    client: EngineContext["client"];
    config: EngineContext["config"];
    orderBook: OrderBook;
    getBookSeq: () => bigint;
    setBookSeq: (seq: bigint) => void;
}): Promise<void> {
    const { client, config } = params;
    let replayed = 0;

    while (true) {
        const messages = await readFromConsumerGroup({
            client,
            streamKey: config.commandStreamKey,
            groupName: config.consumerGroupName,
            consumerName: config.consumerName,
            count: READ_COUNT,
            blockMs: 0,
            lastId: "0"
        });

        if (messages.length === 0) break;

        for (const message of messages) {
            await processMessage({ ...params, message });
            replayed++;
        }
    }

    if (replayed > 0) {
        console.log(`[engine startup] replayed ${replayed} pending commands for ${params.config.market}`);
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

    const { orderBook, bookSeq: restoredBookSeq } = await restoreOrderBook({ client, config });
    let bookSeq = restoredBookSeq;

    await replayPendingCommandMessages({
        client, config, orderBook,
        getBookSeq: () => bookSeq,
        setBookSeq: (seq) => { bookSeq = seq }
    });

    let commandsProcessedSinceSnapshot = 0;
    let lastProcessedCommandStreamId = "0-0";

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

            lastProcessedCommandStreamId = message.id;
            commandsProcessedSinceSnapshot++;

            if (commandsProcessedSinceSnapshot >= SNAPSHOT_EVERY_N_COMMANDS) {
                const { restingOrders, seenOrderIds } = orderBook.toSnapshotState();
                const snapshot: EngineSnapshot = {
                    market: config.market,
                    bookSeq: bookSeq.toString(),
                    restingOrders: restingOrders.map((order) => ({
                        orderId: order.orderId,
                        userId: order.userId,
                        side: order.side,
                        price: order.price.toString(),
                        qtyRemaining: order.qtyRemaining.toString(),
                        seq: order.seq.toString(),
                    })),
                    seenOrderIds,
                    lastCommandStreamId: lastProcessedCommandStreamId,
                    takenAtMs: Date.now(),
                };
                await saveSnapshot(snapshot);
                commandsProcessedSinceSnapshot = 0;
                console.log(`[engine snapshot] saved market=${config.market} bookSeq=${bookSeq} orders=${restingOrders.length}`);
            }
        }
    }
}
