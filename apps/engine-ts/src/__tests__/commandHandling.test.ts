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
                userId: "user-buyer",
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

        applyCommandToOrderBook({
            orderBook,
            command: {
                commandId: "cmd-1",
                market: "TATA-INR",
                kind: "PLACE_LIMIT",
                payload: {
                    orderId: "o-sell",
                    userId: "user-seller",
                    side: "SELL",
                    price: 100n,
                    qty: 5n
                }
            },
            bookSeq: 0n
        });

        const { events, nextBookSeq } = applyCommandToOrderBook({
            orderBook,
            command: {
                commandId: "cmd-2",
                market: "TATA-INR",
                kind: "PLACE_LIMIT",
                payload: {
                    orderId: "o-buy",
                    userId: "user-buyer",
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
                userId: "user-buyer",
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

        applyCommandToOrderBook({
            orderBook,
            command: {
                commandId: "cmd-1",
                market: "TATA-INR",
                kind: "PLACE_LIMIT",
                payload: { orderId: "o-1", userId: "user-buyer", side: "BUY", price: 100n, qty: 10n }
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

describe("PLACE_MARKET flow", () => {
    it("fills against resting limit, emits TRADE + BOOK_DELTA(MARKET_ORDER_SETTLED)", () => {
        const orderBook = new OrderBook("TATA-INR");
        applyCommandToOrderBook({
            orderBook,
            command: {
                commandId: "c1", market: "TATA-INR", kind: "PLACE_LIMIT",
                payload: { orderId: "sell-1", userId: "user-seller", side: "SELL", price: 100n, qty: 5n }
            },
            bookSeq: 0n,
        });

        const { events, nextBookSeq } = applyCommandToOrderBook({
            orderBook,
            command: {
                commandId: "c2", market: "TATA-INR", kind: "PLACE_MARKET",
                payload: { orderId: "mkt-1", userId: "user-buyer", side: "BUY", qty: 5n }
            },
            bookSeq: 1n,
        });

        expect(nextBookSeq).toBe(2n);
        expect(events[0]!.kind).toBe("TRADE");
        const settled = events.find(e => e.kind === "BOOK_DELTA" && e.payload.type === "MARKET_ORDER_SETTLED");
        expect(settled).toBeDefined();
    });

    it("PLACE_MARKET rejected (qty=0) => COMMAND_REJECTED, bookSeq unchanged", () => {
        const orderBook = new OrderBook("TATA-INR");

        const { events, nextBookSeq } = applyCommandToOrderBook({
            orderBook,
            command: {
                commandId: "c-bad", market: "TATA-INR", kind: "PLACE_MARKET",
                payload: { orderId: "mkt-bad", userId: "user-buyer", side: "BUY", qty: 0n }
            },
            bookSeq: 3n,
        });

        expect(nextBookSeq).toBe(3n);
        expect(events).toHaveLength(1);
        expect(events[0]!.kind).toBe("COMMAND_REJECTED");
    });

    it("empty book => COMMAND_REJECTED with NO_LIQUIDITY, bookSeq advances, no MARKET_ORDER_SETTLED", () => {
        const orderBook = new OrderBook("TATA-INR");

        const { events, nextBookSeq } = applyCommandToOrderBook({
            orderBook,
            command: {
                commandId: "c3", market: "TATA-INR", kind: "PLACE_MARKET",
                payload: { orderId: "mkt-2", userId: "user-buyer", side: "BUY", qty: 10n }
            },
            bookSeq: 0n,
        });

        expect(events).toHaveLength(1);
        expect(events[0]!.kind).toBe("COMMAND_REJECTED");
        expect(
            (events[0]!.payload as { rejectReason: string }).rejectReason
        ).toBe("NO_LIQUIDITY");
    });

    it("partial fill => TRADE emitted for filled portion, MARKET_ORDER_SETTLED always follows", () => {
        const orderBook = new OrderBook("TATA-INR");
        applyCommandToOrderBook({
            orderBook,
            command: {
                commandId: "c1", market: "TATA-INR", kind: "PLACE_LIMIT",
                payload: { orderId: "sell-1", userId: "user-seller", side: "SELL", price: 100n, qty: 3n }
            },
            bookSeq: 0n,
        });

        const { events } = applyCommandToOrderBook({
            orderBook,
            command: {
                commandId: "c2", market: "TATA-INR", kind: "PLACE_MARKET",
                payload: { orderId: "mkt-3", userId: "user-buyer", side: "BUY", qty: 10n }
            },
            bookSeq: 1n,
        });

        const trades = events.filter(e => e.kind === "TRADE");
        expect(trades).toHaveLength(1);
        if (trades[0]!.kind === "TRADE") {
            expect(trades[0]!.payload.qty).toBe(3n);
        }
        const settled = events.find(e => e.kind === "BOOK_DELTA" && e.payload.type === "MARKET_ORDER_SETTLED");
        expect(settled).toBeDefined();
        expect(orderBook.getOrder("mkt-3")).toBeNull();
    });
});

describe("CANCEL flow", () => {
    it("CANCEL on non-existent orderId => no-op: zero events, bookSeq still advances", () => {
        // Invariant: cancel unknown orderId => accepted:true, cancelled:false, no delta
        // commandHandling only emits COMMAND_REJECTED when accepted:false — this is accepted:true
        const orderBook = new OrderBook("TATA-INR");
        const { events, nextBookSeq } = applyCommandToOrderBook({
            orderBook,
            command: {
                commandId: "cmd-cancel-ghost",
                market: "TATA-INR",
                kind: "CANCEL",
                payload: { orderId: "ghost-order" }
            },
            bookSeq: 5n
        });

        expect(nextBookSeq).toBe(6n);  // accepted → seq advances
        expect(events).toHaveLength(0); // no delta, no rejection
    });

    it("CANCEL after partial fill => emits BOOK_DELTA CANCEL with correct orderId", () => {
        const orderBook = new OrderBook("TATA-INR");

        applyCommandToOrderBook({
            orderBook,
            command: {
                commandId: "c1", market: "TATA-INR", kind: "PLACE_LIMIT",
                payload: { orderId: "buy-1", userId: "user-buyer", side: "BUY", price: 100n, qty: 10n }
            },
            bookSeq: 0n
        });

        applyCommandToOrderBook({
            orderBook,
            command: {
                commandId: "c2", market: "TATA-INR", kind: "PLACE_LIMIT",
                payload: { orderId: "sell-1", userId: "user-seller", side: "SELL", price: 100n, qty: 3n }
            },
            bookSeq: 1n
        });

        const { events, nextBookSeq } = applyCommandToOrderBook({
            orderBook,
            command: {
                commandId: "c3", market: "TATA-INR", kind: "CANCEL",
                payload: { orderId: "buy-1" }
            },
            bookSeq: 2n
        });

        expect(nextBookSeq).toBe(3n);
        expect(events[0]!.kind).toBe("BOOK_DELTA");
        if (events[0]!.kind === "BOOK_DELTA") {
            expect(events[0]!.payload.type).toBe("CANCEL");
            if (events[0]!.payload.type === "CANCEL") {
                expect(events[0]!.payload.orderId).toBe("buy-1");
            }
        }
    });
});

describe("PEL replay idempotency", () => {
    it("replaying PLACE_LIMIT after seedRestingOrder emits COMMAND_REJECTED, not a second ADD", () => {
        const orderBook = new OrderBook("TATA-INR");

        orderBook.seedRestingOrder({
            orderId: "seed-1",
            userId: "user-seller",
            side: "SELL",
            price: 100n,
            qtyRemaining: 5n,
            seq: 1n
        });

        const { events, nextBookSeq } = applyCommandToOrderBook({
            orderBook,
            command: {
                commandId: "c1", market: "TATA-INR", kind: "PLACE_LIMIT",
                payload: { orderId: "seed-1", userId: "user-seller", side: "SELL", price: 100n, qty: 5n }
            },
            bookSeq: 1n,
        });

        expect(nextBookSeq).toBe(1n);
        expect(events).toHaveLength(1);
        expect(events[0]!.kind).toBe("COMMAND_REJECTED");
        expect(orderBook.getOrder("seed-1")).not.toBeNull();
    });

    it("rehydrated book correctly matches against seeded resting order after PEL replay", () => {
        const orderBook = new OrderBook("TATA-INR");

        orderBook.seedRestingOrder({
            orderId: "seed-sell-1",
            userId: "user-seller",
            side: "SELL",
            price: 100n,
            qtyRemaining: 5n,
            seq: 1n
        });

        const { events } = applyCommandToOrderBook({
            orderBook,
            command: {
                commandId: "c2", market: "TATA-INR", kind: "PLACE_MARKET",
                payload: { orderId: "mkt-buy-1", userId: "user-buyer", side: "BUY", qty: 3n }
            },
            bookSeq: 1n,
        });

        const trades = events.filter(e => e.kind === "TRADE");
        expect(trades).toHaveLength(1);
        if (trades[0]!.kind === "TRADE") {
            expect(trades[0]!.payload.qty).toBe(3n);
            expect(trades[0]!.payload.makerOrderId).toBe("seed-sell-1");
        }
    });
});

describe("WAL dry-run replay correctness", () => {
    it("replaying same command after first apply returns COMMAND_REJECTED, bookSeq does not advance", () => {
        const orderBook = new OrderBook("TATA-INR");
        const command: CommandEnvelope = {
            commandId: "cmd-wal-1", market: "TATA-INR", kind: "PLACE_LIMIT",
            payload: { orderId: "o-wal-1", userId: "user-buyer", side: "BUY", price: 100n, qty: 10n }
        };

        const first = applyCommandToOrderBook({ orderBook, command, bookSeq: 0n });
        expect(first.nextBookSeq).toBe(1n);

        // WAL dry-run: same command re-applied — seenOrderIds blocks it
        const duplicate = applyCommandToOrderBook({ orderBook, command, bookSeq: first.nextBookSeq });
        expect(duplicate.events[0]?.kind).toBe("COMMAND_REJECTED");
        expect(duplicate.nextBookSeq).toBe(1n); // must not advance
    });

    it("discarding WAL dry-run events leaves orderbook state correct", () => {
        const orderBook = new OrderBook("TATA-INR");

        const r1 = applyCommandToOrderBook({
            orderBook,
            command: {
                commandId: "c1", market: "TATA-INR", kind: "PLACE_LIMIT",
                payload: { orderId: "wal-buy", userId: "user-buyer", side: "BUY", price: 100n, qty: 5n }
            },
            bookSeq: 0n
        });

        // events discarded in dry-run — book state must still reflect the trade
        applyCommandToOrderBook({
            orderBook,
            command: {
                commandId: "c2", market: "TATA-INR", kind: "PLACE_LIMIT",
                payload: { orderId: "wal-sell", userId: "user-seller", side: "SELL", price: 100n, qty: 5n }
            },
            bookSeq: r1.nextBookSeq
        });

        expect(orderBook.getBestBid()).toBeNull();
        expect(orderBook.getBestAsk()).toBeNull();
        expect(orderBook.getOrder("wal-buy")).toBeNull();
        expect(orderBook.getOrder("wal-sell")).toBeNull();
    });
});

describe("PLACE_MARKET — 0 fill rejection", () => {
    it("MARKET SELL with empty bid book emits COMMAND_REJECTED with NO_LIQUIDITY", () => {
        const orderBook = new OrderBook("TATA-INR");

        const result = applyCommandToOrderBook({
            orderBook,
            command: {
                commandId: "cmd-1",
                market: "TATA-INR",
                kind: "PLACE_MARKET",
                payload: {
                    orderId: crypto.randomUUID(),
                    userId: "user-1",
                    side: "SELL",
                    qty: 5n,
                },
            },
            bookSeq: 0n,
        });

        expect(result.events).toHaveLength(1);
        expect(result.events[0]!.kind).toBe("COMMAND_REJECTED");
        expect(
            (result.events[0]!.payload as { rejectReason: string }).rejectReason
        ).toBe("NO_LIQUIDITY");
        // bookSeq must still advance to stay in sync with orderbook.lastSeq
        expect(result.nextBookSeq).toBe(1n);
    });

    it("MARKET BUY with empty ask book emits COMMAND_REJECTED with NO_LIQUIDITY", () => {
        const orderBook = new OrderBook("TATA-INR");

        const result = applyCommandToOrderBook({
            orderBook,
            command: {
                commandId: "cmd-2",
                market: "TATA-INR",
                kind: "PLACE_MARKET",
                payload: {
                    orderId: crypto.randomUUID(),
                    userId: "user-1",
                    side: "BUY",
                    qty: 3n,
                },
            },
            bookSeq: 0n,
        });

        expect(result.events[0]!.kind).toBe("COMMAND_REJECTED");
        expect(
            (result.events[0]!.payload as { rejectReason: string }).rejectReason
        ).toBe("NO_LIQUIDITY");
    });

    it("seq stays consistent after 0-fill rejection — next command accepted", () => {
        const orderBook = new OrderBook("TATA-INR");

        const firstResult = applyCommandToOrderBook({
            orderBook,
            command: {
                commandId: "cmd-3",
                market: "TATA-INR",
                kind: "PLACE_MARKET",
                payload: {
                    orderId: crypto.randomUUID(),
                    userId: "user-1",
                    side: "SELL",
                    qty: 5n,
                },
            },
            bookSeq: 0n,
        });

        expect(firstResult.nextBookSeq).toBe(1n);

        // Next command using firstResult.nextBookSeq must not get SEQ_OUT_OF_ORDER
        const secondResult = applyCommandToOrderBook({
            orderBook,
            command: {
                commandId: "cmd-4",
                market: "TATA-INR",
                kind: "PLACE_LIMIT",
                payload: {
                    orderId: crypto.randomUUID(),
                    userId: "user-2",
                    side: "BUY",
                    price: 100n,
                    qty: 1n,
                },
            },
            bookSeq: firstResult.nextBookSeq,
        });

        expect(secondResult.events.every((e) => e.kind !== "COMMAND_REJECTED")).toBe(true);
    });
});
