import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { saveSnapshot, loadSnapshot } from "../persistence/snapshotStore";

const TEST_SNAPSHOT_DIR = "/tmp/arbitium-test-snapshots";

beforeEach(async () => {
    await fs.mkdir(TEST_SNAPSHOT_DIR, { recursive: true });
});

afterEach(async () => {
    await fs.rm(TEST_SNAPSHOT_DIR, { recursive: true, force: true });
});

describe("snapshotStore", () => {
    it("saveSnapshot + loadSnapshot roundtrips correctly", async () => {
        const snapshot = {
            market: "TATA-INR",
            bookSeq: "42",
            restingOrders: [],
            seenOrderIds: ["o-1", "o-2"],
            lastCommandStreamId: "1700000000000-3",
            takenAtMs: 1700000000000,
        };

        await saveSnapshot(snapshot, TEST_SNAPSHOT_DIR);
        const loaded = await loadSnapshot("TATA-INR", TEST_SNAPSHOT_DIR);

        expect(loaded).toEqual(snapshot);
    });

    it("loadSnapshot returns null when file does not exist", async () => {
        const result = await loadSnapshot("MISSING-INR", TEST_SNAPSHOT_DIR);
        expect(result).toBeNull();
    });

    it("loadSnapshot returns null for corrupt JSON — does not throw", async () => {
        const filePath = path.join(TEST_SNAPSHOT_DIR, "BAD-INR.json");
        await fs.writeFile(filePath, "{ not valid json", "utf-8");

        const result = await loadSnapshot("BAD-INR", TEST_SNAPSHOT_DIR);
        expect(result).toBeNull();
    });

    it("loadSnapshot returns null for structurally invalid snapshot", async () => {
        const filePath = path.join(TEST_SNAPSHOT_DIR, "INVALID-INR.json");
        await fs.writeFile(filePath, JSON.stringify({ market: "INVALID-INR" }), "utf-8");

        const result = await loadSnapshot("INVALID-INR", TEST_SNAPSHOT_DIR);
        expect(result).toBeNull();
    });
});
