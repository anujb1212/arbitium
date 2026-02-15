import { describe, expect, it } from "vitest";
import { decodeEventFromStreamFields, encodeEventToStreamFields } from "../wireCodec";
import type { EventEnvelope } from "../types";
import { pairsToRecord } from "./helpers";


describe('engine wireCodec(event)', () => {
    it("roundtrips TRADE event", () => {
        const event: EventEnvelope = {
            market: "TATA-INR",
            kind: "TRADE",
            bookSeq: 10n,
            commandId: "cmd-1",
            payload: {
                takerOrderId: "t1",
                makerOrderId: "m1",
                price: 100n,
                qty: 2n,
                takerSide: "BUY",
            },
        };

        const fields = pairsToRecord(encodeEventToStreamFields(event));
        const decoded = decodeEventFromStreamFields(fields);
        expect(decoded.accepted).toBe(true);
        if (!decoded.accepted) return;
        expect(decoded.value).toEqual(event);
    });

    it("rejects TRADE event when bookSeq is missing", () => {
        const event: EventEnvelope = {
            market: "TATA-INR",
            kind: "TRADE",
            bookSeq: 11n,
            payload: { takerOrderId: "t2", makerOrderId: "m2", price: 101n, qty: 1n, takerSide: "SELL" },
        };

        const fields = pairsToRecord(encodeEventToStreamFields(event));
        delete fields.bookSeq;
        expect(decodeEventFromStreamFields(fields)).toEqual({ accepted: false, rejectReason: "MISSING_OR_INVALID_BOOK_SEQ" });
    });


})