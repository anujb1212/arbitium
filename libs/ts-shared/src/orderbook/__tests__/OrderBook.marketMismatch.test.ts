import { describe, it, expect } from "vitest";
import { OrderBook } from "../OrderBook";


describe("OrderBook - market mismatch + seq", () => {
    it("Market mismatch is rejected and does NOT consume seq", () => {
        const orderBook = new OrderBook("TATA_INR");

        const wrong = orderBook.placeLimit({
            market: "PAYTM_INR",
            orderId: "B1",
            side: "BUY",
            price: 100n,
            qty: 1n,
            seq: 100n,
        });

        expect(wrong.accepted).toBe(false);
        expect(wrong.rejectReason).toBe("MARKET_MISMATCH");

        const ok = orderBook.placeLimit({
            market: "TATA_INR",
            orderId: "B2",
            side: "BUY",
            price: 100n,
            qty: 1n,
            seq: 1n,
        });

        expect(ok.accepted).toBe(true);
    });

    it("Seq is still strictly increasing for correct market", () => {
        const orderBook = new OrderBook("TATA_INR");

        const ok = orderBook.cancel({ market: "TATA_INR", orderId: "NONE", seq: 5n });
        expect(ok.accepted).toBe(true);

        const bad = orderBook.cancel({ market: "TATA_INR", orderId: "NONE", seq: 5n });
        expect(bad.accepted).toBe(false);
        expect(bad.rejectReason).toBe("SEQ_OUT_OF_ORDER");
    });
});
