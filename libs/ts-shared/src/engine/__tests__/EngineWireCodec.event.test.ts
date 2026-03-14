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
                executedAtMs: 1700000000000,
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
            payload: {
                takerOrderId: "t2",
                makerOrderId: "m2",
                price: 101n,
                qty: 1n,
                takerSide: "SELL",
                executedAtMs: 1700000000000
            },
        };

        const fields = pairsToRecord(encodeEventToStreamFields(event));
        delete fields.bookSeq;
        expect(decodeEventFromStreamFields(fields)).toEqual({ accepted: false, rejectReason: "MISSING_OR_INVALID_BOOK_SEQ" });
    });

    it("roundtrips BOOK_DELTA CANCEL event with side price and qty", () => {
        const event: EventEnvelope = {
            market: "TATA-INR",
            kind: "BOOK_DELTA",
            bookSeq: 12n,
            commandId: "cmd-cancel-1",
            payload: {
                type: "CANCEL",
                orderId: "o-1",
                side: "BUY",
                price: 100n,
                qty: 3n,
            },
        };

        const fields = pairsToRecord(encodeEventToStreamFields(event));
        const decoded = decodeEventFromStreamFields(fields);
        expect(decoded.accepted).toBe(true);
        if (!decoded.accepted) return;
        expect(decoded.value).toEqual(event);
    });

    it("rejects BOOK_DELTA CANCEL event when side price or qty is missing", () => {
        const event: EventEnvelope = {
            market: "TATA-INR",
            kind: "BOOK_DELTA",
            bookSeq: 13n,
            payload: {
                type: "CANCEL",
                orderId: "o-2",
                side: "SELL",
                price: 101n,
                qty: 4n,
            },
        };

        const fields = pairsToRecord(encodeEventToStreamFields(event));
        delete fields.price;
        expect(decodeEventFromStreamFields(fields)).toEqual({ accepted: false, rejectReason: "INVALID_PRICE" });
    });
})