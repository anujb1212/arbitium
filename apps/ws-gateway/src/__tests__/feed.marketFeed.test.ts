import { describe, it, expect, vi, beforeEach } from "vitest";
import { MarketFeed } from "../feed/MarketFeed";

vi.mock("@arbitium/ts-engine-client/streams/readStreamSince", () => ({
    readStreamSince: vi.fn(),
}));
vi.mock("@arbitium/ts-shared/engine/wireCodec", () => ({
    decodeEventFromStreamFields: vi.fn(),
}));

import { readStreamSince } from "@arbitium/ts-engine-client/streams/readStreamSince";
import { decodeEventFromStreamFields } from "@arbitium/ts-shared/engine/wireCodec";

function makeMockRedisClient() {
    return {
        sendCommand: vi.fn(),
        connect: vi.fn(),
        quit: vi.fn(),
        on: vi.fn()
    }
}

describe("MarketFeed", () => {
    beforeEach(() => vi.clearAllMocks());

    it("fans out decoded events to all listeners", async () => {
        const mockEnvelope = {
            market: "TATA-INR",
            kind: "TRADE",
            bookSeq: 1n
        } as any

        vi.mocked(readStreamSince).mockResolvedValue([{
            id: "1700-0",
            fields: {}
        }]);

        vi.mocked(decodeEventFromStreamFields).mockReturnValue({
            accepted: true,
            value: mockEnvelope
        });

        const feed = new MarketFeed("TATA-INR", makeMockRedisClient() as any);
        const listenerA = vi.fn();
        const listenerB = vi.fn();
        feed.addListener(listenerA);
        feed.addListener(listenerB);

        await feed.readAndFanOut();

        expect(listenerA).toHaveBeenCalledWith(mockEnvelope);
        expect(listenerB).toHaveBeenCalledWith(mockEnvelope);
    });

    it("skips malformed messages without throwing", async () => {
        vi.mocked(readStreamSince).mockResolvedValue([{
            id: "1700-0",
            fields: {}
        }])

        vi.mocked(decodeEventFromStreamFields).mockReturnValue({
            accepted: false,
            rejectReason: "INVALID_EVENT_KIND"
        })

        const feed = new MarketFeed("TATA-INR", makeMockRedisClient() as any);
        const listener = vi.fn();
        feed.addListener(listener);

        await expect(feed.readAndFanOut()).resolves.not.toThrow();
        expect(listener).not.toHaveBeenCalled();
    });

    it("advances lastSeenEventId so next XREAD starts after last processed message", async () => {
        const firstId = "1700000000001-0";
        vi.mocked(readStreamSince).mockResolvedValueOnce([{
            id: firstId,
            fields: {}
        }])

        vi.mocked(decodeEventFromStreamFields).mockReturnValue({
            accepted: true,
            value: {} as any
        })

        vi.mocked(readStreamSince).mockResolvedValueOnce([]);

        const feed = new MarketFeed("TATA-INR", makeMockRedisClient() as any);
        feed.addListener(vi.fn());

        await feed.readAndFanOut();
        await feed.readAndFanOut();

        expect(readStreamSince).toHaveBeenLastCalledWith(
            expect.objectContaining({ fromId: firstId })
        );
    });

    it("injects eventId from stream entry ID into decoded fields", async () => {
        const streamId = "1700000000042-0";
        vi.mocked(readStreamSince).mockResolvedValue([{ id: streamId, fields: { kind: "TRADE" } }]);
        vi.mocked(decodeEventFromStreamFields).mockReturnValue({ accepted: true, value: {} as any });

        const feed = new MarketFeed("TATA-INR", makeMockRedisClient() as any);

        feed.addListener(vi.fn());
        await feed.readAndFanOut();

        expect(decodeEventFromStreamFields).toHaveBeenCalledWith(
            expect.objectContaining({ eventId: streamId })
        );
    });
});
