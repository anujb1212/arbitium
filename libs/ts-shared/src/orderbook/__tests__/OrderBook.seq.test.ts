import { describe, it, expect } from "vitest";
import { OrderBook } from "../OrderBook";

describe("OrderBook - seq ordering", () => {
    it("Rejects out-of-order seq (placeLimit)", () => {
        const orderBook = new OrderBook("TATA_INR");

        const ok = orderBook.placeLimit({
            market: "TATA_INR",
            orderId: "B1",
            side: "BUY",
            price: 100n,
            qty: 1n,
            seq: 2n,
        });
        expect(ok.accepted).toBe(true);

        const bad = orderBook.placeLimit({
            market: "TATA_INR",
            orderId: "B2",
            side: "BUY",
            price: 100n,
            qty: 1n,
            seq: 1n,
        });
        expect(bad.accepted).toBe(false);
        expect(bad.rejectReason).toBe("SEQ_OUT_OF_ORDER");
    });

    it("Cancel unknown consumes seq; later lower seq is rejected", () => {
        const orderBook = new OrderBook("TATA_INR");

        const cancel1 = orderBook.cancel({ market: "TATA_INR", orderId: "NONE", seq: 5n });
        expect(cancel1.accepted).toBe(true);
        expect(cancel1.cancelled).toBe(false);

        const bad = orderBook.placeLimit({
            market: "TATA_INR",
            orderId: "B1",
            side: "BUY",
            price: 100n,
            qty: 1n,
            seq: 4n,
        });
        expect(bad.accepted).toBe(false);
        expect(bad.rejectReason).toBe("SEQ_OUT_OF_ORDER");
    });
});