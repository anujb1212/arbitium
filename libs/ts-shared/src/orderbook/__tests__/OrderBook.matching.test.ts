import { describe, it, expect } from "vitest";
import { OrderBook } from "../OrderBook";

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