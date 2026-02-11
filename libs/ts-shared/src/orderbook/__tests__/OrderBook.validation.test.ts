import { describe, it, expect } from "vitest";
import { OrderBook } from "../OrderBook";

describe("OrderBook - duplicate orderId", () => {
    it("Rejects duplicate orderId and does not change book state", () => {
        const orderBook = new OrderBook("TATA_INR");

        const first = orderBook.placeLimit({
            market: "TATA_INR",
            orderId: "B1",
            side: "BUY",
            price: 100n,
            qty: 5n,
            seq: 1n,
        });
        expect(first.accepted).toBe(true);
        expect(orderBook.getBestBid()).toBe(100n);

        const second = orderBook.placeLimit({
            market: "TATA_INR",
            orderId: "B1", // duplicate
            side: "BUY",
            price: 101n,
            qty: 5n,
            seq: 2n,
        });
        expect(second.accepted).toBe(false);
        expect(second.rejectReason).toBe("DUPLICATE_ORDER_ID");

        // state should remain as it was after first order
        expect(orderBook.getBestBid()).toBe(100n);
        expect(orderBook.getOrder("B1")?.price).toBe(100n);
        expect(orderBook.getOrder("B1")?.qtyRemaining).toBe(5n);
    });
});

describe("OrderBook - duplicate orderId after fill", () => {
    it("Rejects duplicate orderId even if original order got filled", () => {
        const orderBook = new OrderBook("TATA_INR");

        orderBook.placeLimit({
            market: "TATA_INR",
            orderId: "S1",
            side: "SELL",
            price: 100n,
            qty: 5n,
            seq: 1n
        });

        const first = orderBook.placeLimit({
            market: "TATA_INR",
            orderId: "B1",
            side: "BUY",
            price: 100n,
            qty: 5n,
            seq: 2n
        });

        expect(first.accepted).toBe(true);
        expect(orderBook.getOrder("B1")).toBe(null); // filled, not resting

        const second = orderBook.placeLimit({
            market: "TATA_INR",
            orderId: "B1",
            side: "BUY",
            price: 100n,
            qty: 1n,
            seq: 3n
        });

        expect(second.accepted).toBe(false);
        expect(second.rejectReason).toBe("DUPLICATE_ORDER_ID");
    });
});
