import { describe, it, expect } from "vitest";
import { runScenario, runScenarioCancelMiddle } from "./helpers";

describe("OrderBook - replay", () => {
    it("Same commands => same trades+deltas (exact order)", () => {
        const out1 = runScenario();
        const out2 = runScenario();

        expect(out1.buyResult.trades).toEqual(out2.buyResult.trades);
        expect(out1.buyResult.deltas).toEqual(out2.buyResult.deltas);
        expect(out1.cancelResult).toEqual(out2.cancelResult);
    });

    it("Same commands => same final book state", () => {
        const out1 = runScenario();
        const out2 = runScenario();

        expect(out1.bestBid).toBe(out2.bestBid);
        expect(out1.bestAsk).toBe(out2.bestAsk);
        expect(out1.s1).toBe(out2.s1);
        expect(out1.s2).toEqual(out2.s2);
        expect(out1.s3).toBe(out2.s3);
    });
});

describe("OrderBook - replay (cancel middle FIFO)", () => {
    it("Same commands => same outputs (exact order)", () => {
        const out1 = runScenarioCancelMiddle();
        const out2 = runScenarioCancelMiddle();

        expect(out1).toEqual(out2);
    });

    it("Cancel middle preserves FIFO: fills S1 then S3", () => {
        const out = runScenarioCancelMiddle();

        expect(out.cancelS2.accepted).toBe(true);
        expect(out.cancelS2.cancelled).toBe(true);

        expect(out.buyResult.accepted).toBe(true);
        expect(out.buyResult.trades.map(t => t.makerOrderId)).toEqual(["S1", "S3"]);

        expect(out.s1).toBe(null);
        expect(out.s2).toBe(null);
        expect(out.s3).toBe(null);
        expect(out.bestAsk).toBe(null);
    });
});
