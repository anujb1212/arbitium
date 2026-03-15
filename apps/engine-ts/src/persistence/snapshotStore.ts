import * as fs from "node:fs/promises";
import * as path from "node:path";

export interface SnapshotRestingOrder {
    orderId: string;
    userId: string;
    side: "BUY" | "SELL";
    price: string;        // bigint serialized
    qtyRemaining: string;
    seq: string;
}

export interface EngineSnapshot {
    market: string;
    bookSeq: string;
    restingOrders: SnapshotRestingOrder[];
    seenOrderIds: string[];
    lastCommandStreamId: string;  // last ACK'd stream message ID
    takenAtMs: number;
}

const DEFAULT_SNAPSHOT_DIR = process.env.SNAPSHOT_DIR ?? "./snapshots";

export async function saveSnapshot(
    snapshot: EngineSnapshot,
    snapshotDir: string = DEFAULT_SNAPSHOT_DIR
): Promise<void> {
    await fs.mkdir(snapshotDir, { recursive: true });
    const filePath = path.join(snapshotDir, `${snapshot.market}.json`);
    const tmpPath = `${filePath}.tmp`;
    await fs.writeFile(tmpPath, JSON.stringify(snapshot), "utf-8");
    await fs.rename(tmpPath, filePath); // atomic on same filesystem
}

function isValidSnapshot(parsed: unknown): parsed is EngineSnapshot {
    if (typeof parsed !== "object" || parsed === null) return false;
    const s = parsed as Record<string, unknown>;
    return (
        typeof s["market"] === "string" &&
        typeof s["bookSeq"] === "string" &&
        Array.isArray(s["restingOrders"]) &&
        Array.isArray(s["seenOrderIds"]) &&
        typeof s["lastCommandStreamId"] === "string" &&
        typeof s["takenAtMs"] === "number" &&
        /^\d+$/.test(s["bookSeq"] as string)
    );
}

export async function loadSnapshot(
    market: string,
    snapshotDir: string = DEFAULT_SNAPSHOT_DIR
): Promise<EngineSnapshot | null> {
    const filePath = path.join(snapshotDir, `${market}.json`);
    try {
        const raw = await fs.readFile(filePath, "utf-8");
        let parsed: unknown;
        try {
            parsed = JSON.parse(raw);
        } catch {
            console.error(`[snapshotStore] corrupt snapshot for ${market} — ignoring, starting fresh`);
            return null;
        }
        if (!isValidSnapshot(parsed)) {
            console.error(`[snapshotStore] corrupt snapshot for ${market} — ignoring, starting fresh`);
            return null;
        }
        return parsed;
    } catch (error: unknown) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
        throw error;
    }
}
