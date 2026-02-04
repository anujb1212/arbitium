import { describe, it, expect } from "vitest";
import { OrderBook } from "../OrderBook";

describe("OrderBook resting-only", () => {
    it("BUY rests: best bid updates, order retrievable", () => {
        const ob = new OrderBook("TATA_INR");

        const r = ob.placeLimit({
            market: "TATA_INR",
            orderId: "B1",
            side: "BUY",
            price: 100n,
            qty: 5n,
            seq: 1n,
        });

        expect(r.trades).toEqual([]);
        expect(r.remainingQty).toBe(5n);
        expect(ob.getBestBid()).toBe(100n);
        expect(ob.getBestAsk()).toBe(null);
        expect(ob.getOrder("B1")?.qtyRemaining).toBe(5n);
    });

    it("SELL rests: best ask is lowest ask", () => {
        const ob = new OrderBook("TATA_INR");

        ob.placeLimit({
            market: "TATA_INR",
            orderId: "S1",
            side: "SELL",
            price: 101n,
            qty: 1n,
            seq: 1n
        });

        ob.placeLimit({
            market: "TATA_INR",
            orderId: "S2",
            side: "SELL",
            price: 100n,
            qty: 1n,
            seq: 2n
        });

        expect(ob.getBestAsk()).toBe(100n); // lowest ask 
    });

    it("Cancel removes resting order and clears best bid when level empty", () => {
        const ob = new OrderBook("TATA_INR");

        ob.placeLimit({
            market: "TATA_INR",
            orderId: "B1",
            side: "BUY",
            price: 100n,
            qty: 5n,
            seq: 1n
        });

        const c = ob.cancel({
            market: "TATA_INR",
            orderId: "B1",
            seq: 2n
        });

        expect(c.cancelled).toBe(true);
        expect(ob.getOrder("B1")).toBe(null);
        expect(ob.getBestBid()).toBe(null);
    });

    it("Cancel unknown order is a no-op", () => {
        const ob = new OrderBook("TATA_INR");

        const c = ob.cancel({
            market: "TATA_INR",
            orderId: "NOPE",
            seq: 1n
        });
        expect(c.cancelled).toBe(false);
        expect(c.deltas).toEqual([]);
    });
});
