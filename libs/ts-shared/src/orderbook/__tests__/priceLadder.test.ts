import { describe, it, expect } from "vitest";
import { OrderBook } from "../OrderBook";

describe("price ladder helpers", () => {
    it("Asks stay sorted ASC so best ask is lowest", () => {
        const ob: any = new OrderBook("TATA_INR");
        ob.insertAskPrice(101n);
        ob.insertAskPrice(100n);
        ob.insertAskPrice(105n);
        expect(ob.getBestAsk()).toBe(100n);
    });

    it("Bids stay sorted DESC so best bid is highest", () => {
        const ob: any = new OrderBook("TATA_INR");
        ob.insertBidPrice(99n);
        ob.insertBidPrice(101n);
        ob.insertBidPrice(100n);
        expect(ob.getBestBid()).toBe(101n);
    });
});
