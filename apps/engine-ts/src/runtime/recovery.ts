import { OrderBook } from "@arbitium/ts-shared/orderbook";
import { readFromConsumerGroup } from "@arbitium/ts-engine-client";
import { decodeCommandFromStreamFields } from "@arbitium/ts-shared/engine/wireCodec";
import { loadSnapshot } from "../persistence/snapshotStore";
import { applyCommandToOrderBook } from "./commandHandling";
import type { EngineContext } from "./types";
import type { RestingOrder } from "@arbitium/ts-shared/orderbook/types";

const WAL_REPLAY_BATCH_SIZE = 100;
const PEL_FETCH_BATCH_SIZE = 100;
const DEPTH_SNAPSHOT_LEVELS = 20;

async function fetchAllPendingMessageIds(params: {
    client: EngineContext["client"];
    config: EngineContext["config"];
}): Promise<string[]> {
    const { client, config } = params;
    const pendingIds: string[] = [];

    while (true) {
        const messages = await readFromConsumerGroup({
            client,
            streamKey: config.commandStreamKey,
            groupName: config.consumerGroupName,
            consumerName: config.consumerName,
            count: PEL_FETCH_BATCH_SIZE,
            blockMs: 0,
            lastId: "0",
        });
        if (messages.length === 0) break;
        for (const message of messages) {
            pendingIds.push(message.id);
        }
        if (messages.length < PEL_FETCH_BATCH_SIZE) break;
    }

    return pendingIds;
}

async function replayWALDryRun(params: {
    client: EngineContext["client"];
    config: EngineContext["config"];
    orderBook: OrderBook;
    fromStreamId: string;
    stopBeforeStreamId: string | null;
    bookSeq: bigint;
}): Promise<bigint> {
    const { client, config, orderBook, stopBeforeStreamId } = params;
    let bookSeq = params.bookSeq;
    let searchId = `(${params.fromStreamId}`;
    let replayed = 0;

    while (true) {
        const reply = await client.sendCommand([
            "XRANGE",
            config.commandStreamKey,
            searchId,
            "+",
            "COUNT",
            String(WAL_REPLAY_BATCH_SIZE),
        ]) as Array<[string, string[]]>;

        if (reply.length === 0) break;

        for (const [entryId, rawFields] of reply) {
            if (stopBeforeStreamId !== null && entryId >= stopBeforeStreamId) {
                console.log(`[engine WAL] replayed ${replayed} commands for ${config.market}, stopped before PEL`);
                return bookSeq;
            }

            const fields: Record<string, string> = {};
            for (let i = 0; i + 1 < rawFields.length; i += 2) {
                fields[rawFields[i]!] = rawFields[i + 1]!;
            }

            const decoded = decodeCommandFromStreamFields(fields);
            if (decoded.accepted) {
                const { nextBookSeq } = applyCommandToOrderBook({
                    orderBook,
                    command: decoded.value,
                    bookSeq,
                });
                bookSeq = nextBookSeq;
                replayed++;
            }

            searchId = `(${entryId}`;
        }

        if (reply.length < WAL_REPLAY_BATCH_SIZE) break;
    }

    if (replayed > 0) {
        console.log(`[engine WAL] replayed ${replayed} ACK'd commands for ${config.market}`);
    }
    return bookSeq;
}

export async function restoreOrderBook(params: {
    client: EngineContext["client"];
    config: EngineContext["config"];
}): Promise<{ orderBook: OrderBook; bookSeq: bigint }> {
    const { client, config } = params;
    const orderBook = new OrderBook(config.market);

    const snapshot = await loadSnapshot(config.market);

    if (!snapshot) {
        console.log(`[engine recovery] no snapshot for ${config.market} — starting fresh, PEL replay will recover state`);
        return { orderBook, bookSeq: 0n };
    }

    const restingOrders: RestingOrder[] = snapshot.restingOrders.map((order) => ({
        orderId: order.orderId,
        userId: order.userId,
        side: order.side,
        price: BigInt(order.price),
        qtyRemaining: BigInt(order.qtyRemaining),
        seq: BigInt(order.seq),
    }));
    const snapshotBookSeq = BigInt(snapshot.bookSeq);
    orderBook.restoreFromSnapshotState({
        restingOrders,
        seenOrderIds: snapshot.seenOrderIds,
        bookSeq: snapshotBookSeq,
    });
    console.log(
        `[engine recovery] snapshot loaded market=${config.market} orders=${restingOrders.length} bookSeq=${snapshotBookSeq} takenAt=${new Date(snapshot.takenAtMs).toISOString()}`
    );

    const pendingMessageIds = await fetchAllPendingMessageIds({ client, config });
    const minPendingId = pendingMessageIds.length > 0
        ? pendingMessageIds.reduce((min, id) => (id < min ? id : min))
        : null;

    const restoredBookSeq = await replayWALDryRun({
        client,
        config,
        orderBook,
        fromStreamId: snapshot.lastCommandStreamId,
        stopBeforeStreamId: minPendingId,
        bookSeq: snapshotBookSeq,
    });

    const depthJson = JSON.stringify(
        orderBook.getDepth(DEPTH_SNAPSHOT_LEVELS),
        (_k, v) => (typeof v === "bigint" ? v.toString() : v)
    );
    await client.sendCommand(["SET", `arbitium:depth:${config.market}`, depthJson]);

    return { orderBook, bookSeq: restoredBookSeq };
}
