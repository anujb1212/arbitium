import { describe, it, expect } from "vitest";
import { OrderBook } from "../OrderBook";

describe("OrderBook.placeMarket", () => {
    it("fills against best ask at any price — no price check", () => {
        const book = new OrderBook("TATA-INR");

        book.placeLimit({
            market: "TATA-INR",
            orderId: "sell-1",
            userId: "user-A",
            side: "SELL",
            price: 200n,
            qty: 5n,
            seq: 1n
        });

        const result = book.placeMarket({
            market: "TATA-INR",
            orderId: "mkt-buy-1",
            userId: "user-B",
            side: "BUY",
            qty: 5n,
            seq: 2n
        });

        expect(result.accepted).toBe(true);
        expect(result.trades).toHaveLength(1);
        expect(result.trades[0]!.price).toBe(200n); // fills at maker's price
        expect(result.filledQty).toBe(5n);
        expect(result.remainingQty).toBe(0n);
    });

    it("does NOT rest in book — emits MARKET_ORDER_SETTLED even on partial fill", () => {
        const book = new OrderBook("TATA-INR");

        book.placeLimit({
            market: "TATA-INR",
            orderId: "sell-1",
            userId: "user-A",
            side: "SELL",
            price: 100n,
            qty: 3n,
            seq: 1n
        });

        const result = book.placeMarket({
            market: "TATA-INR",
            orderId: "mkt-buy-1",
            userId: "user-B",
            side: "BUY",
            qty: 10n,
            seq: 2n
        });

        expect(result.filledQty).toBe(3n);
        expect(result.remainingQty).toBe(7n);
        expect(book.getOrder("mkt-buy-1")).toBeNull(); // not resting
        const settled = result.deltas.find(d => d.type === "MARKET_ORDER_SETTLED");
        expect(settled).toBeDefined();
    });

    it("emits MARKET_ORDER_SETTLED with no fills when book is empty", () => {
        const book = new OrderBook("TATA-INR");

        const result = book.placeMarket({
            market: "TATA-INR",
            orderId: "mkt-buy-1",
            userId: "user-A",
            side: "BUY",
            qty: 5n,
            seq: 1n
        });

        expect(result.accepted).toBe(true);
        expect(result.trades).toHaveLength(0);
        expect(result.filledQty).toBe(0n);
        const settled = result.deltas.find(d => d.type === "MARKET_ORDER_SETTLED");
        expect(settled).toBeDefined();
    });

    it("rejects duplicate orderId", () => {
        const book = new OrderBook("TATA-INR");

        book.placeMarket({
            market: "TATA-INR",
            orderId: "mkt-1",
            userId: "user-B",
            side: "BUY",
            qty: 5n,
            seq: 1n
        });

        const result = book.placeMarket({
            market: "TATA-INR",
            orderId: "mkt-1",
            userId: "user-B",
            side: "BUY",
            qty: 5n,
            seq: 2n
        });

        expect(result.accepted).toBe(false);
        expect(result.rejectReason).toBe("DUPLICATE_ORDER_ID");
    });
});
