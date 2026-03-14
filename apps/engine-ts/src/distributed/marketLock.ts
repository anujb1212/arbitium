import * as os from "node:os";
import type { EngineContext } from "../runtime/types";

const LOCK_TTL_SECONDS = 15;
const HEARTBEAT_INTERVAL_MS = 5_000;

const HEARTBEAT_SCRIPT = `
  if redis.call("GET", KEYS[1]) == ARGV[1] then
    return redis.call("EXPIRE", KEYS[1], ARGV[2])
  else
    return 0
  end
`;

const RELEASE_SCRIPT = `
  if redis.call("GET", KEYS[1]) == ARGV[1] then
    return redis.call("DEL", KEYS[1])
  else
    return 0
  end
`;

function lockKey(market: string): string {
    return `arbitium:engine-lock:${market}`;
}

export function generateInstanceId(): string {
    return `${os.hostname()}-${process.pid}`;
}

export async function acquireMarketLock(params: {
    client: EngineContext["client"];
    market: string;
    instanceId: string;
}): Promise<boolean> {
    const { client, market, instanceId } = params;
    const result = await client.sendCommand([
        "SET", lockKey(market), instanceId,
        "NX", "EX", String(LOCK_TTL_SECONDS)
    ]);
    return result === "OK";
}

export function startLockHeartbeat(params: {
    client: EngineContext["client"];
    market: string;
    instanceId: string;
    onHeartbeatFailed: (market: string) => void;
}): NodeJS.Timeout {
    const { client, market, instanceId, onHeartbeatFailed } = params;

    return setInterval(async () => {
        try {
            const result = await client.sendCommand([
                "EVAL", HEARTBEAT_SCRIPT, "1",
                lockKey(market), instanceId, String(LOCK_TTL_SECONDS)
            ]);
            if (result !== 1) {
                onHeartbeatFailed(market);
            }
        } catch (error) {
            console.error(`[engine lock] heartbeat error market=${market}:`, error);
            onHeartbeatFailed(market);
        }
    }, HEARTBEAT_INTERVAL_MS);
}

export async function releaseMarketLock(params: {
    client: EngineContext["client"];
    market: string;
    instanceId: string;
}): Promise<void> {
    const { client, market, instanceId } = params;
    await client.sendCommand([
        "EVAL", RELEASE_SCRIPT, "1",
        lockKey(market), instanceId
    ]);
    console.log(`[engine lock] released market=${market} instance=${instanceId}`);
}
