import { describe, expect, it } from "vitest";
import { parseStreamReadReply } from "../streams/replyParsing";

describe("streams.replyParsing", () => {
    it("returns empty for null/undefined/empty", () => {
        expect(parseStreamReadReply(null)).toEqual([]);
        expect(parseStreamReadReply(undefined)).toEqual([]);
        expect(parseStreamReadReply([])).toEqual([]);
    });

    it("parses a valid XREAD/XREADGROUP reply shape", () => {
        const reply = [
            [
                "arbitium:test:stream",
                [
                    ["1-0", ["market", "TATA-INR", "kind", "CANCEL", "commandId", "cmd-1", "orderId", "o-1"]],
                    ["2-0", ["market", "TATA-INR", "kind", "CANCEL", "commandId", "cmd-2", "orderId", "o-2"]]
                ]
            ]
        ];

        const messages = parseStreamReadReply(reply);

        expect(messages).toHaveLength(2);
        expect(messages[0]!.id).toBe("1-0");
        expect(messages[0]!.fields.market).toBe("TATA-INR");
        expect(messages[1]!.id).toBe("2-0");
        expect(messages[1]!.fields.commandId).toBe("cmd-2");
    });

    it("throws on invalid reply shapes", () => {
        expect(() => parseStreamReadReply([["stream", "not-entries"] as any])).toThrow();
        expect(() => parseStreamReadReply([["stream", [["1-0", ["a", "b", "c"]]]] as any])).toThrow(); // odd field/value count
    });
});
