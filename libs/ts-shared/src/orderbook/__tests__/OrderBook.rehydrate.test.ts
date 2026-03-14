import { describe, it, expect } from "vitest";
import { OrderBook } from "../OrderBook";

describe("OrderBook.seedRestingOrder", () => {
    it("seeded order is cancellable and returns CANCEL delta", () => {
        const book = new OrderBook("TATA-INR");

        book.seedRestingOrder({
            orderId: "seed-1",
            userId: "user-B",
            side: "BUY",
            price: 10000n,
            qtyRemaining: 5n,
            seq: 10n
        });

        const result = book.cancel({
            market: "TATA-INR",
            orderId: "seed-1",
            seq: 11n
        });

        expect(result.accepted).toBe(true);
        expect(result.deltas).toHaveLength(1);
        const delta = result.deltas[0]!;
        expect(delta.type).toBe("CANCEL");
        if (delta.type === "CANCEL") {
            expect(delta.orderId).toBe("seed-1");
        }
    });

    it("seeded order participates in matching as resting maker", () => {
        const book = new OrderBook("TATA-INR");

        book.seedRestingOrder({
            orderId: "seed-ask",
            userId: "user-A",
            side: "SELL",
            price: 10000n,
            qtyRemaining: 5n,
            seq: 10n
        });

        const result = book.placeLimit({
            market: "TATA-INR",
            orderId: "incoming-buy",
            userId: "user-B",
            side: "BUY",
            price: 10000n,
            qty: 5n,
            seq: 11n
        });

        expect(result.accepted).toBe(true);
        expect(result.trades).toHaveLength(1);
        expect(result.trades[0]!.makerOrderId).toBe("seed-ask");
        expect(result.trades[0]!.takerOrderId).toBe("incoming-buy");
    });

    it("duplicate seedRestingOrder is a no-op — does not double insert", () => {
        const book = new OrderBook("TATA-INR");

        book.seedRestingOrder({
            orderId: "seed-1",
            userId: "user-B",
            side: "BUY",
            price: 10000n,
            qtyRemaining: 5n,
            seq: 10n
        });
        book.seedRestingOrder({
            orderId: "seed-1",
            userId: "user-B",
            side: "BUY",
            price: 10000n,
            qtyRemaining: 5n,
            seq: 10n
        });

        const depth = book.getDepth(5);
        expect(depth.bids[0]!.qty).toBe(5n);
    });
});
