import { describe, it, expect } from "vitest";
import { OrderBook } from "../OrderBook";

describe("OrderBook - cancel edge cases", () => {
    it("Cancel after fully filled maker is a no-op", () => {
        const orderBook = new OrderBook("TATA_INR");

        orderBook.placeLimit({
            market: "TATA_INR",
            orderId: "S1",
            side: "SELL",
            price: 100n,
            qty: 5n,
            seq: 1n,
        });

        orderBook.placeLimit({
            market: "TATA_INR",
            orderId: "B1",
            side: "BUY",
            price: 100n,
            qty: 5n,
            seq: 2n,
        });

        expect(orderBook.getOrder("S1")).toBe(null);
        expect(orderBook.getBestAsk()).toBe(null);

        const cancelResult = orderBook.cancel({
            market: "TATA_INR",
            orderId: "S1",
            seq: 3n
        });
        expect(cancelResult.cancelled).toBe(false);
        expect(cancelResult.deltas).toEqual([]);
    });

    it("Partial fill then cancel removes remaining and clears level", () => {
        const orderBook = new OrderBook("TATA_INR");

        orderBook.placeLimit({
            market: "TATA_INR",
            orderId: "S1",
            side: "SELL",
            price: 100n,
            qty: 10n,
            seq: 1n,
        });

        orderBook.placeLimit({
            market: "TATA_INR",
            orderId: "B1",
            side: "BUY",
            price: 100n,
            qty: 4n,
            seq: 2n,
        });

        expect(orderBook.getOrder("S1")?.qtyRemaining).toBe(6n);
        expect(orderBook.getBestAsk()).toBe(100n);

        const cancelResult = orderBook.cancel({
            market: "TATA_INR",
            orderId: "S1",
            seq: 3n
        });
        expect(cancelResult.cancelled).toBe(true);
        expect(orderBook.getOrder("S1")).toBe(null);
        expect(orderBook.getBestAsk()).toBe(null);
    });
});

describe("OrderBook - cancel idempotency", () => {
    it("Cancel same order twice: first cancels, second is no-op", () => {
        const orderBook = new OrderBook("TATA_INR");

        const place = orderBook.placeLimit({
            market: "TATA_INR",
            orderId: "S1",
            side: "SELL",
            price: 100n,
            qty: 5n,
            seq: 1n,
        });
        expect(place.accepted).toBe(true);

        const cancel1 = orderBook.cancel({
            market: "TATA_INR",
            orderId: "S1",
            seq: 2n
        });

        expect(cancel1.accepted).toBe(true);
        expect(cancel1.cancelled).toBe(true);
        expect(cancel1.deltas.length).toBe(1);
        expect(orderBook.getOrder("S1")).toBe(null);
        expect(orderBook.getBestAsk()).toBe(null);

        const cancel2 = orderBook.cancel({
            market: "TATA_INR",
            orderId: "S1",
            seq: 3n
        });

        expect(cancel2.accepted).toBe(true);
        expect(cancel2.cancelled).toBe(false);
        expect(cancel2.deltas).toEqual([]);
    });
});