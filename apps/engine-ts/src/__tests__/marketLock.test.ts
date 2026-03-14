import { describe, it, expect, vi, beforeEach } from "vitest";
import { acquireMarketLock, releaseMarketLock, startLockHeartbeat } from "../distributed/marketLock";

function makeMockClient(responses: unknown[]): { sendCommand: ReturnType<typeof vi.fn> } {
    let callIndex = 0;
    return {
        sendCommand: vi.fn(async () => responses[callIndex++] ?? null),
    };
}

describe("acquireMarketLock", () => {
    it("returns true when Redis responds OK (lock free)", async () => {
        const client = makeMockClient(["OK"]);
        const result = await acquireMarketLock({
            client: client as any,
            market: "TATA-INR",
            instanceId: "host-123",
        });
        expect(result).toBe(true);
        expect(client.sendCommand).toHaveBeenCalledWith([
            "SET", "arbitium:engine-lock:TATA-INR", "host-123",
            "NX", "EX", "15"
        ]);
    });

    it("returns false when Redis responds null (lock already held)", async () => {
        const client = makeMockClient([null]);
        const result = await acquireMarketLock({
            client: client as any,
            market: "TATA-INR",
            instanceId: "host-456",
        });
        expect(result).toBe(false);
    });
});

describe("startLockHeartbeat", () => {
    beforeEach(() => { vi.useFakeTimers(); });

    it("calls onHeartbeatFailed when Lua script returns 0 (lock stolen)", async () => {
        const client = makeMockClient([0]);
        const onHeartbeatFailed = vi.fn();

        const timer = startLockHeartbeat({
            client: client as any,
            market: "TATA-INR",
            instanceId: "host-123",
            onHeartbeatFailed,
        });

        await vi.advanceTimersByTimeAsync(5_000);
        expect(onHeartbeatFailed).toHaveBeenCalledWith("TATA-INR");
        clearInterval(timer);
    });

    it("does not call onHeartbeatFailed when Lua script returns 1 (still owner)", async () => {
        const client = makeMockClient([1]);
        const onHeartbeatFailed = vi.fn();

        const timer = startLockHeartbeat({
            client: client as any,
            market: "TATA-INR",
            instanceId: "host-123",
            onHeartbeatFailed,
        });

        await vi.advanceTimersByTimeAsync(5_000);
        expect(onHeartbeatFailed).not.toHaveBeenCalled();
        clearInterval(timer);
    });
});
