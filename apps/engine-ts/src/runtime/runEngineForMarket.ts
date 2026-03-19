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

function engineLog(level: "INFO" | "WARN" | "ERROR", fields: Record<string, unknown>): void {
    process.stdout.write(JSON.stringify({ ts: Date.now(), level, svc: "engine", ...fields }) + "\n")
}

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

        const cmdWriteTs = parseInt(message.id.split("-")[0]!, 10)
        const cmdToEvtMs = Date.now() - cmdWriteTs

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

        engineLog(cmdToEvtMs > 500 ? "WARN" : "INFO", {
            event: "COMMAND_PROCESSED",
            market: config.market,
            messageId: message.id,
            commandKind: decoded.value.kind,
            commandId: decoded.value.commandId,
            eventsEmitted: events.length,
            cmdToEvtMs,
        })

    } catch (error) {
        engineLog("ERROR", {
            event: "COMMAND_PROCESS_FAILED",
            market: config.market,
            messageId: message.id,
            error: (error as Error).message,
        })

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
    const { config } = params;
    let replayed = 0;

    while (true) {
        const messages = await readFromConsumerGroup({
            client: params.client,
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
        console.log(`[engine startup] replayed ${replayed} pending commands for ${config.market}`);
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

    // ↓ variables declared BEFORE takeSnapshot — closure captures correctly
    let commandsProcessedSinceSnapshot = 0;
    let lastProcessedCommandStreamId = "0-0";

    async function takeSnapshot(): Promise<void> {
        const { restingOrders, seenOrderIds } = orderBook.toSnapshotState()
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
        }
        await saveSnapshot(snapshot)
        engineLog("INFO", {
            event: "SNAPSHOT_SAVED",
            market: config.market,
            bookSeq: bookSeq.toString(),
            orderCount: restingOrders.length,
        })
    }

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

            lastProcessedCommandStreamId = message.id
            commandsProcessedSinceSnapshot++

            if (commandsProcessedSinceSnapshot >= SNAPSHOT_EVERY_N_COMMANDS) {
                await takeSnapshot()
                commandsProcessedSinceSnapshot = 0
            }
        }
    }

    // Graceful shutdown — always save final state
    await takeSnapshot()
}
