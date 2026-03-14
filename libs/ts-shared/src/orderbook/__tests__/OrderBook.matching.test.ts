import { describe, it, expect } from "vitest";
import { OrderBook } from "../OrderBook";

describe("OrderBook - matching", () => {
    it("FIFO within same price (partial fill)", () => {
        const orderBook = new OrderBook("TATA_INR");

        orderBook.placeLimit({
            market: "TATA_INR",
            orderId: "S1",
            userId: "user-A",
            side: "SELL",
            price: 100n,
            qty: 5n,
            seq: 1n
        });

        orderBook.placeLimit({
            market: "TATA_INR",
            orderId: "S2",
            userId: "user-A",
            side: "SELL",
            price: 100n,
            qty: 7n,
            seq: 2n
        });

        const buyResult = orderBook.placeLimit({
            market: "TATA_INR",
            orderId: "B1",
            userId: "user-B",
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
            userId: "user-A",
            side: "SELL",
            price: 101n,
            qty: 5n,
            seq: 1n
        });

        orderBook.placeLimit({
            market: "TATA_INR",
            orderId: "S_best",
            userId: "user-A",
            side: "SELL",
            price: 100n,
            qty: 5n,
            seq: 2n
        });

        const buyResult = orderBook.placeLimit({
            market: "TATA_INR",
            orderId: "B1",
            userId: "user-B",
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

describe("OrderBook - matching sweep", () => {
    it("Sweeps multiple price levels and leaves partial resting on last level", () => {
        const orderBook = new OrderBook("TATA_INR");

        orderBook.placeLimit({
            market: "TATA_INR",
            orderId: "S1",
            userId: "user-A",
            side: "SELL",
            price: 100n,
            qty: 3n,
            seq: 1n
        });

        orderBook.placeLimit({
            market: "TATA_INR",
            orderId: "S2",
            userId: "user-A",
            side: "SELL",
            price: 100n,
            qty: 3n,
            seq: 2n
        });

        orderBook.placeLimit({
            market: "TATA_INR",
            orderId: "S3",
            userId: "user-A",
            side: "SELL",
            price: 101n,
            qty: 5n,
            seq: 3n
        });

        const buy = orderBook.placeLimit({
            market: "TATA_INR",
            orderId: "B1",
            userId: "user-B",
            side: "BUY",
            price: 101n,
            qty: 7n,
            seq: 4n,
        });

        expect(buy.accepted).toBe(true);
        expect(buy.remainingQty).toBe(0n);

        // price priority then FIFO
        expect(buy.trades.map(t => [t.makerOrderId, t.price, t.qty])).toEqual([
            ["S1", 100n, 3n],
            ["S2", 100n, 3n],
            ["S3", 101n, 1n],
        ]);

        expect(orderBook.getOrder("S1")).toBe(null);
        expect(orderBook.getOrder("S2")).toBe(null);
        expect(orderBook.getOrder("S3")?.qtyRemaining).toBe(4n);
        expect(orderBook.getBestAsk()).toBe(101n);
    });
});

describe("OrderBook - self-trade prevention", () => {
    it("LIMIT BUY does not fill against own resting SELL", () => {
        const orderBook = new OrderBook("TATA_INR");

        orderBook.placeLimit({
            market: "TATA_INR", orderId: "S1", userId: "user-A",
            side: "SELL", price: 100n, qty: 10n, seq: 1n
        });

        const result = orderBook.placeLimit({
            market: "TATA_INR", orderId: "B1", userId: "user-A",
            side: "BUY", price: 100n, qty: 10n, seq: 2n
        });

        expect(result.accepted).toBe(true);
        expect(result.trades).toHaveLength(0);
        expect(result.remainingQty).toBe(10n);
        expect(orderBook.getBestBid()).toBe(100n);
        expect(orderBook.getBestAsk()).toBe(100n);
    });

    it("LIMIT BUY skips own SELL but fills next user in queue at same price", () => {
        const orderBook = new OrderBook("TATA_INR");

        orderBook.placeLimit({
            market: "TATA_INR", orderId: "S-A", userId: "user-A",
            side: "SELL", price: 100n, qty: 5n, seq: 1n
        });

        orderBook.placeLimit({
            market: "TATA_INR", orderId: "S-B", userId: "user-B",
            side: "SELL", price: 100n, qty: 5n, seq: 2n
        });

        const result = orderBook.placeLimit({
            market: "TATA_INR", orderId: "B-A", userId: "user-A",
            side: "BUY", price: 100n, qty: 5n, seq: 3n
        });

        expect(result.accepted).toBe(true);
        expect(result.trades).toHaveLength(1);
        expect(result.trades[0]!.makerOrderId).toBe("S-B");
        expect(result.trades[0]!.qty).toBe(5n);
        expect(result.remainingQty).toBe(0n);
        expect(orderBook.getOrder("S-A")).not.toBe(null); // own order untouched
    });

    it("MARKET BUY does not fill against own resting SELL", () => {
        const orderBook = new OrderBook("TATA_INR");

        orderBook.placeLimit({
            market: "TATA_INR", orderId: "S1", userId: "user-A",
            side: "SELL", price: 100n, qty: 10n, seq: 1n
        });

        const result = orderBook.placeMarket({
            market: "TATA_INR", orderId: "M1", userId: "user-A",
            side: "BUY", qty: 10n, seq: 2n
        });

        expect(result.accepted).toBe(true);
        expect(result.trades).toHaveLength(0);
        expect(result.filledQty).toBe(0n);
        expect(result.deltas.at(-1)!.type).toBe("MARKET_ORDER_SETTLED");
    });

    it("LIMIT SELL does not fill against own resting BUY", () => {
        const orderBook = new OrderBook("TATA_INR");

        orderBook.placeLimit({
            market: "TATA_INR", orderId: "B1", userId: "user-A",
            side: "BUY", price: 100n, qty: 10n, seq: 1n
        });

        const result = orderBook.placeLimit({
            market: "TATA_INR", orderId: "S1", userId: "user-A",
            side: "SELL", price: 100n, qty: 10n, seq: 2n
        });

        expect(result.accepted).toBe(true);
        expect(result.trades).toHaveLength(0);
        expect(result.remainingQty).toBe(10n);
        expect(orderBook.getBestBid()).toBe(100n);
        expect(orderBook.getBestAsk()).toBe(100n);
    });
});
