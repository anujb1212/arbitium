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
            payload: { orderId: "o3", side: "BUY", price: 10n, qty: 1n },
        };

        const fields = pairsToRecord(encodeCommandToStreamFields(command));
        fields.kind = "BAD_KIND";
        expect(decodeCommandFromStreamFields(fields)).toEqual({ accepted: false, rejectReason: "INVALID_COMMAND_KIND" });
    });
})