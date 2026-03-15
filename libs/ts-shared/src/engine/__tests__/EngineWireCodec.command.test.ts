import { describe, expect, it } from "vitest";
import { decodeCommandFromStreamFields, encodeCommandToStreamFields } from "../wireCodec";
import type { CommandEnvelope } from "../types";
import { pairsToRecord } from "./helpers";


describe('engine wireCodec(command)', () => {
    it("roundtrips PLACE_LIMIT command with bigints", () => {
        const command: CommandEnvelope = {
            commandId: "cmd-1",
            market: "TATA-INR",
            kind: "PLACE_LIMIT",
            payload: {
                orderId: "o1",
                userId: "user-test",
                side: "BUY",
                price: 100n,
                qty: 2n
            },
        };

        const fields = pairsToRecord(encodeCommandToStreamFields(command));
        const decoded = decodeCommandFromStreamFields(fields);
        expect(decoded.accepted).toBe(true);
        if (!decoded.accepted) return;
        expect(decoded.value).toEqual(command);
    });

    it("roundtrips CANCEL command", () => {
        const command: CommandEnvelope = {
            commandId: "cmd-cancel-1",
            market: "TATA-INR",
            kind: "CANCEL",
            payload: { orderId: "o1" },
        };

        const fields = pairsToRecord(encodeCommandToStreamFields(command));
        const decoded = decodeCommandFromStreamFields(fields);
        expect(decoded.accepted).toBe(true);
        if (!decoded.accepted) return;
        expect(decoded.value).toEqual(command);
    });

    it("rejects non-canonical decimal bigint strings", () => {
        const command: CommandEnvelope = {
            commandId: "cmd-2",
            market: "TATA-INR",
            kind: "PLACE_LIMIT",
            payload: {
                orderId: "o2",
                userId: "user-test",
                side: "SELL",
                price: 1n,
                qty: 2n
            },
        };

        const fields = pairsToRecord(encodeCommandToStreamFields(command));
        fields.price = "01";
        const decoded = decodeCommandFromStreamFields(fields);
        expect(decoded).toEqual({
            accepted: false,
            rejectReason: "INVALID_PRICE"
        });
    });

    it("rejects invalid command kind", () => {
        const command: CommandEnvelope = {
            commandId: "cmd-3",
            market: "TATA-INR",
            kind: "PLACE_LIMIT",
            payload: {
                orderId: "o3",
                userId: "user-test",
                side: "BUY",
                price: 10n,
                qty: 1n
            },
        };

        const fields = pairsToRecord(encodeCommandToStreamFields(command));
        fields.kind = "BAD_KIND";
        expect(decodeCommandFromStreamFields(fields)).toEqual({ accepted: false, rejectReason: "INVALID_COMMAND_KIND" });
    });

    it("roundtrips PLACE_MARKET command with bigint qty", () => {
        const command: CommandEnvelope = {
            commandId: "cmd-market-1",
            market: "TATA-INR",
            kind: "PLACE_MARKET",
            payload: {
                orderId: "o-mkt-1",
                userId: "user-buyer",
                side: "BUY",
                qty: 500n,
            },
        };

        const fields = pairsToRecord(encodeCommandToStreamFields(command));
        const decoded = decodeCommandFromStreamFields(fields);
        expect(decoded.accepted).toBe(true);
        if (!decoded.accepted) return;
        expect(decoded.value).toEqual(command);
    });

    it("roundtrips PLACE_MARKET SELL side", () => {
        const command: CommandEnvelope = {
            commandId: "cmd-market-2",
            market: "RELIANCE-INR",
            kind: "PLACE_MARKET",
            payload: {
                orderId: "o-mkt-2",
                userId: "user-seller",
                side: "SELL",
                qty: 1000n,
            },
        };

        const fields = pairsToRecord(encodeCommandToStreamFields(command));
        const decoded = decodeCommandFromStreamFields(fields);
        expect(decoded.accepted).toBe(true);
        if (!decoded.accepted) return;
        expect(decoded.value).toEqual(command);
    });

    it("rejects PLACE_MARKET with invalid side", () => {
        const command: CommandEnvelope = {
            commandId: "cmd-market-3",
            market: "TATA-INR",
            kind: "PLACE_MARKET",
            payload: {
                orderId: "o-mkt-3",
                userId: "user-buyer",
                side: "BUY",
                qty: 10n,
            },
        };

        const fields = pairsToRecord(encodeCommandToStreamFields(command));
        fields["side"] = "INVALID";
        expect(decodeCommandFromStreamFields(fields)).toEqual({
            accepted: false,
            rejectReason: "INVALID_SIDE",
        });
    });

    it("rejects PLACE_MARKET with missing qty field", () => {
        const command: CommandEnvelope = {
            commandId: "cmd-market-4",
            market: "TATA-INR",
            kind: "PLACE_MARKET",
            payload: {
                orderId: "o-mkt-4",
                userId: "user-buyer",
                side: "BUY",
                qty: 10n,
            },
        };

        const fields = pairsToRecord(encodeCommandToStreamFields(command));
        delete fields["qty"];
        expect(decodeCommandFromStreamFields(fields)).toEqual({
            accepted: false,
            rejectReason: "INVALID_QTY",
        });
    });
})