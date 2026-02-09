import { describe, it, expect } from "vitest";
import { OrderBook } from "../OrderBook";

describe("OrderBook - resting", () => {
    it("BUY rests: best bid updates, order retrievable", () => {
        const orderBook = new OrderBook("TATA_INR");

        const placeResult = orderBook.placeLimit({
            market: "TATA_INR",
            orderId: "B1",
            side: "BUY",
            price: 100n,
            qty: 5n,
            seq: 1n,
        });

        expect(placeResult.trades).toEqual([]);
        expect(placeResult.remainingQty).toBe(5n);
        expect(orderBook.getBestBid()).toBe(100n);
        expect(orderBook.getBestAsk()).toBe(null);
        expect(orderBook.getOrder("B1")?.qtyRemaining).toBe(5n);
    });

    it("SELL rests: best ask is lowest ask", () => {
        const orderBook = new OrderBook("TATA_INR");

        orderBook.placeLimit({
            market: "TATA_INR",
            orderId: "S1",
            side: "SELL",
            price: 101n,
            qty: 1n,
            seq: 1n
        });

        orderBook.placeLimit({
            market: "TATA_INR",
            orderId: "S2",
            side: "SELL",
            price: 100n,
            qty: 1n,
            seq: 2n
        });

        expect(orderBook.getBestAsk()).toBe(100n);
    });

    it("Cancel removes resting order and clears best bid when level empty", () => {
        const orderBook = new OrderBook("TATA_INR");

        orderBook.placeLimit({
            market: "TATA_INR",
            orderId: "B1",
            side: "BUY",
            price: 100n,
            qty: 5n,
            seq: 1n
        });

        const cancelResult = orderBook.cancel({ market: "TATA_INR", orderId: "B1", seq: 2n });

        expect(cancelResult.cancelled).toBe(true);
        expect(orderBook.getOrder("B1")).toBe(null);
        expect(orderBook.getBestBid()).toBe(null);
    });

    it("Cancel unknown order is a no-op", () => {
        const orderBook = new OrderBook("TATA_INR");

        const cancelResult = orderBook.cancel({
            market: "TATA_INR",
            orderId: "NONE",
            seq: 1n
        });

        expect(cancelResult.cancelled).toBe(false);
        expect(cancelResult.deltas).toEqual([]);
    });
});

describe("OrderBook - matching", () => {
    it("FIFO within same price (partial fill)", () => {
        const orderBook = new OrderBook("TATA_INR");

        orderBook.placeLimit({
            market: "TATA_INR",
            orderId: "S1",
            side: "SELL",
            price: 100n,
            qty: 5n,
            seq: 1n
        });

        orderBook.placeLimit({
            market: "TATA_INR",
            orderId: "S2",
            side: "SELL",
            price: 100n,
            qty: 7n,
            seq: 2n
        });

        const buyResult = orderBook.placeLimit({
            market: "TATA_INR",
            orderId: "B1",
            side: "BUY",
            price: 100n,
            qty: 10n,
            seq: 3n
        });

        expect(buyResult.trades.map(trade => [trade.makerOrderId, trade.qty])).toEqual([["S1", 5n], ["S2", 5n]]);
        expect(orderBook.getOrder("S1")).toBe(null);
        expect(orderBook.getOrder("S2")?.qtyRemaining).toBe(2n);
        expect(orderBook.getBestAsk()).toBe(100n);
    });

    it("Price priority beats time", () => {
        const orderBook = new OrderBook("TATA_INR");

        orderBook.placeLimit({
            market: "TATA_INR",
            orderId: "S_old",
            side: "SELL",
            price: 101n,
            qty: 5n,
            seq: 1n
        });

        orderBook.placeLimit({
            market: "TATA_INR",
            orderId: "S_best",
            side: "SELL",
            price: 100n,
            qty: 5n,
            seq: 2n
        });

        const buyResult = orderBook.placeLimit({
            market: "TATA_INR",
            orderId: "B1",
            side: "BUY",
            price: 101n,
            qty: 5n,
            seq: 3n
        });

        expect(buyResult.trades.length).toBe(1);
        expect(buyResult.trades[0]?.makerOrderId).toBe("S_best");
        expect(buyResult.trades[0]?.price).toBe(100n);
    });
});

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