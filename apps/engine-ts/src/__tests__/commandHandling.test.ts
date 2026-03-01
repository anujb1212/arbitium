import { describe, it, expect } from "vitest";
import { OrderBook } from "@arbitium/ts-shared/orderbook";
import { applyCommandToOrderBook } from "../runtime/commandHandling";
import type { CommandEnvelope } from "@arbitium/ts-shared/engine/types";

describe("commandHandling", () => {
    it("PLACE_LIMIT accepted => emits BOOK_DELTA ADD event, advances bookSeq", () => {
        const orderBook = new OrderBook("TATA-INR");
        const command: CommandEnvelope = {
            commandId: "cmd-1",
            market: "TATA-INR",
            kind: "PLACE_LIMIT",
            payload: {
                orderId: "o-1",
                side: "BUY",
                price: 100n,
                qty: 10n
            }
        };

        const { events, nextBookSeq } = applyCommandToOrderBook({ orderBook, command, bookSeq: 0n });

        expect(nextBookSeq).toBe(1n);
        expect(events).toHaveLength(1);
        expect(events[0]!.kind).toBe("BOOK_DELTA");
        if (events[0]!.kind !== "COMMAND_REJECTED") {
            expect(events[0]!.bookSeq).toBe(1n);
        }
    });

    it("PLACE_LIMIT with match => emits TRADE then BOOK_DELTA in order", () => {
        const orderBook = new OrderBook("TATA-INR");

        // Resting sell
        applyCommandToOrderBook({
            orderBook,
            command: {
                commandId: "cmd-1",
                market: "TATA-INR",
                kind: "PLACE_LIMIT",
                payload: {
                    orderId: "o-sell",
                    side: "SELL",
                    price: 100n,
                    qty: 5n
                }
            },
            bookSeq: 0n
        });

        // Incoming buy crosses
        const { events, nextBookSeq } = applyCommandToOrderBook({
            orderBook,
            command: {
                commandId: "cmd-2",
                market: "TATA-INR",
                kind: "PLACE_LIMIT",
                payload: {
                    orderId: "o-buy",
                    side: "BUY",
                    price: 100n,
                    qty: 5n
                }
            },
            bookSeq: 1n
        });

        expect(nextBookSeq).toBe(2n);
        expect(events[0]!.kind).toBe("TRADE");
        expect(events[1]!.kind).toBe("BOOK_DELTA");
    });

    it("PLACE_LIMIT rejected => emits COMMAND_REJECTED, bookSeq unchanged", () => {
        const orderBook = new OrderBook("TATA-INR");
        const command: CommandEnvelope = {
            commandId: "cmd-bad",
            market: "TATA-INR",
            kind: "PLACE_LIMIT",
            payload: {
                orderId: "o-1",
                side: "BUY",
                price: 0n,
                qty: 10n
            }
        };

        const { events, nextBookSeq } = applyCommandToOrderBook({ orderBook, command, bookSeq: 0n });

        expect(nextBookSeq).toBe(0n);
        expect(events[0]!.kind).toBe("COMMAND_REJECTED");
    });

    it("CANCEL accepted => emits BOOK_DELTA CANCEL", () => {
        const orderBook = new OrderBook("TATA-INR");

        const placed = applyCommandToOrderBook({
            orderBook,
            command: {
                commandId: "cmd-1",
                market: "TATA-INR",
                kind: "PLACE_LIMIT",
                payload: { orderId: "o-1", side: "BUY", price: 100n, qty: 10n }
            },
            bookSeq: 0n
        });

        const { events } = applyCommandToOrderBook({
            orderBook,
            command: {
                commandId: "cmd-2",
                market: "TATA-INR",
                kind: "CANCEL",
                payload: { orderId: "o-1" }
            },
            bookSeq: 1n
        });

        expect(events).toHaveLength(1);
        expect(events[0]!.kind).toBe("BOOK_DELTA");
        if (events[0]!.kind === "BOOK_DELTA") {
            expect(events[0]!.payload.type).toBe("CANCEL");
        }
    });
});

describe("CANCEL flow", () => {
    it("CANCEL on non-existent orderId => emits COMMAND_REJECTED, bookSeq unchanged", () => {
        const orderBook = new OrderBook("TATA-INR")
        const { events, nextBookSeq } = applyCommandToOrderBook({
            orderBook,
            command: {
                commandId: "cmd-cancel-ghost",
                market: "TATA-INR",
                kind: "CANCEL",
                payload: { orderId: "ghost-order" }
            },
            bookSeq: 5n
        })

        expect(nextBookSeq).toBe(5n)
        expect(events[0]!.kind).toBe("COMMAND_REJECTED")
    })

    it("CANCEL after partial fill => emits BOOK_DELTA CANCEL with correct orderId", () => {
        const orderBook = new OrderBook("TATA-INR")

        applyCommandToOrderBook({
            orderBook,
            command: {
                commandId: "c1", market: "TATA-INR", kind: "PLACE_LIMIT",
                payload: { orderId: "buy-1", side: "BUY", price: 100n, qty: 10n }
            },
            bookSeq: 0n
        })

        applyCommandToOrderBook({
            orderBook,
            command: {
                commandId: "c2", market: "TATA-INR", kind: "PLACE_LIMIT",
                payload: { orderId: "sell-1", side: "SELL", price: 100n, qty: 3n }
            },
            bookSeq: 1n
        })

        const { events, nextBookSeq } = applyCommandToOrderBook({
            orderBook,
            command: {
                commandId: "c3", market: "TATA-INR", kind: "CANCEL",
                payload: { orderId: "buy-1" }
            },
            bookSeq: 2n
        })

        expect(nextBookSeq).toBe(3n)
        expect(events[0]!.kind).toBe("BOOK_DELTA")
        if (events[0]!.kind === "BOOK_DELTA") {
            expect(events[0]!.payload.type).toBe("CANCEL")
            if (events[0]!.payload.type === "CANCEL") {
                expect(events[0]!.payload.orderId).toBe("buy-1")
            }
        }
    })
})

