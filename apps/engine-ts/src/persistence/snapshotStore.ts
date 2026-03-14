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

export async function loadSnapshot(
    market: string,
    snapshotDir: string = DEFAULT_SNAPSHOT_DIR
): Promise<EngineSnapshot | null> {
    const filePath = path.join(snapshotDir, `${market}.json`);
    try {
        const raw = await fs.readFile(filePath, "utf-8");
        return JSON.parse(raw) as EngineSnapshot;
    } catch (error: unknown) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
        throw error;
    }
}
