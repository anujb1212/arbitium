import { OrderBook } from "@arbitium/ts-shared/orderbook";
import type { CommandEnvelope, EventEnvelope } from "@arbitium/ts-shared/engine/types";
import type { BookDelta, Trade } from "@arbitium/ts-shared/orderbook/types";

export function applyCommandToOrderBook(params: {
    orderBook: OrderBook;
    command: CommandEnvelope;
    bookSeq: bigint
}): {
    events: EventEnvelope[];
    nextBookSeq: bigint
} {
    const { orderBook, command, bookSeq } = params
    const nextBookSeq = bookSeq + 1n
    const events: EventEnvelope[] = []

    if (command.kind === "PLACE_LIMIT") {
        const result = orderBook.placeLimit({
            market: command.market,
            orderId: command.payload.orderId,
            side: command.payload.side,
            price: command.payload.price,
            qty: command.payload.qty,
            seq: nextBookSeq
        })

        if (!result.accepted) {
            events.push({
                market: command.market,
                kind: "COMMAND_REJECTED",
                payload: {
                    commandKind: command.kind,
                    rejectReason: result.rejectReason!
                },
                commandId: command.commandId
            })

            return {
                events,
                nextBookSeq: bookSeq
            }
        }

        for (const trade of result.trades) {
            events.push(tradeToEventEnvelope(
                trade,
                command.market,
                nextBookSeq,
                command.commandId
            ))
        }

        for (const delta of result.deltas) {
            events.push(deltaToEventEnvelope(
                delta,
                command.market,
                nextBookSeq,
                command.commandId
            ))
        }

        return {
            events,
            nextBookSeq
        }
    }

    if (command.kind === "CANCEL") {
        const result = orderBook.cancel({
            market: command.market,
            orderId: command.payload.orderId,
            seq: nextBookSeq
        })

        if (!result.accepted) {
            events.push({
                market: command.market,
                kind: "COMMAND_REJECTED",
                payload: {
                    commandKind: command.kind,
                    rejectReason: result.rejectReason!
                },
                commandId: command.commandId
            });

            return {
                events,
                nextBookSeq: bookSeq
            };
        }

        for (const delta of result.deltas) {
            events.push(deltaToEventEnvelope(
                delta,
                command.market,
                nextBookSeq,
                command.commandId
            ))
        }

        return {
            events,
            nextBookSeq
        }
    }

    const _exhaustive: never = command
    return _exhaustive
}

function tradeToEventEnvelope(
    trade: Trade,
    market: string,
    bookSeq: bigint,
    commandId?: string
): EventEnvelope {

    return {
        market,
        kind: "TRADE",
        bookSeq,
        payload: {
            takerOrderId: trade.takerOrderId,
            makerOrderId: trade.makerOrderId,
            price: trade.price,
            qty: trade.qty,
            takerSide: trade.takerSide
        },
        commandId
    };
}

function deltaToEventEnvelope(
    delta: BookDelta,
    market: string,
    bookSeq: bigint,
    commandId?: string
): EventEnvelope {

    return {
        market,
        kind: "BOOK_DELTA",
        bookSeq,
        payload: delta,
        commandId
    };
}
