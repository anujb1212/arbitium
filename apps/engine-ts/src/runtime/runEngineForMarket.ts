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
import { prisma } from "@arbitium/db";

const READ_COUNT = 10;
const BLOCK_MS = 2000;
const DEPTH_SNAPSHOT_LEVELS = 20;

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
        const engineInternalMs = performance.now() - engineStartMs
        console.log(
            `[latency] market=${config.market}` +
            ` events=${events.length}` +
            ` cmd→engine=${cmdToEngineMs}ms` +
            ` engine_internal=${engineInternalMs.toFixed(1)}ms`
        )

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

async function clearPendingCommandMessages(params: {
    client: EngineContext["client"];
    config: EngineContext["config"];
}): Promise<void> {
    const { client, config } = params;

    while (true) {
        const pendingReply = await client.sendCommand([
            "XPENDING",
            config.commandStreamKey,
            config.consumerGroupName,
            "-", "+", "100"
        ]) as Array<[string, string, string, string]>;

        if (pendingReply.length === 0) break;

        const messageIds = pendingReply.map((entry) => entry[0]);
        await client.sendCommand([
            "XACK",
            config.commandStreamKey,
            config.consumerGroupName,
            ...messageIds
        ]);

        console.log(`[engine startup] ACKed ${messageIds.length} stale pending commands for ${config.market}`);

        if (pendingReply.length < 100) break;
    }
}

async function rehydrateOrderBook(params: {
    client: EngineContext["client"];
    config: EngineContext["config"];
    orderBook: OrderBook;
}): Promise<bigint> {
    const { client, config, orderBook } = params;

    const lastEventReply = await client.sendCommand([
        "XREVRANGE", config.eventStreamKey, "+", "-", "COUNT", "1"
    ]) as Array<[string, string[]]>;

    let bookSeq = 0n;
    if (lastEventReply.length > 0) {
        const fields = lastEventReply[0]![1]!;
        const bookSeqIdx = fields.indexOf("bookSeq");
        if (bookSeqIdx !== -1 && fields[bookSeqIdx + 1]) {
            bookSeq = BigInt(fields[bookSeqIdx + 1]!);
        }
    }

    const openOrders = await prisma.order.findMany({
        where: {
            market: config.market,
            status: { in: ["OPEN", "PARTIALLY_FILLED"] }
        },
        orderBy: { createdAt: "asc" },
        select: { id: true, side: true, price: true, qty: true, filledQty: true }
    });

    for (const order of openOrders) {
        const qtyRemaining = order.qty - order.filledQty;
        if (qtyRemaining <= 0n) continue;
        orderBook.seedRestingOrder({
            orderId: order.id,
            side: order.side,
            price: order.price,
            qtyRemaining,
            seq: bookSeq
        });
    }

    const depthJson = JSON.stringify(
        orderBook.getDepth(DEPTH_SNAPSHOT_LEVELS),
        (_k, v) => (typeof v === "bigint" ? v.toString() : v)
    )
    await client.sendCommand(["SET", `arbitium:depth:${config.market}`, depthJson])

    console.log(`[engine rehydrate] market=${config.market} orders=${openOrders.length} bookSeq=${bookSeq}`)
    return bookSeq;
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
    let bookSeq = await rehydrateOrderBook({ client, config, orderBook });

    await clearPendingCommandMessages({ client, config });

    await client.sendCommand([
        "XGROUP", "SETID",
        config.commandStreamKey,
        config.consumerGroupName,
        "$"
    ]);

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
