import { describe, expect, it } from "vitest";
import { flattenStreamFields } from "../streams/fieldEncoding";

describe("streams.fieldEncoding", () => {
    it("flattens key-value pairs", () => {
        expect(flattenStreamFields([["a", "1"], ["b", "2"]])).toEqual(["a", "1", "b", "2"]);
    });

    it("rejects empty fields", () => {
        expect(() => flattenStreamFields([])).toThrow();
    });
});
