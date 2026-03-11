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

    describe("concurrent readAndFanOut — in-flight guard", () => {
        it("should not fan out duplicate events when two pings fire simultaneously", async () => {
            let resolveFirstRead!: () => void
            const firstReadGate = new Promise<void>((resolve) => { resolveFirstRead = resolve })

            vi.mocked(readStreamSince)
                .mockImplementationOnce(async () => {
                    await firstReadGate
                    return [{ id: "1700-1", fields: {} }]
                })
                .mockResolvedValue([])

            vi.mocked(decodeEventFromStreamFields).mockReturnValue({
                accepted: true,
                value: { kind: "TRADE" } as any
            })

            const feed = new MarketFeed("TATA-INR", makeMockRedisClient() as any)
            const listener = vi.fn()
            feed.addListener(listener)

            const callA = feed.readAndFanOut()
            const callB = feed.readAndFanOut()

            resolveFirstRead()
            await Promise.all([callA, callB])


            expect(listener).toHaveBeenCalledTimes(1)
            expect(readStreamSince).toHaveBeenCalledTimes(2)
        })

        it("should re-read after first read completes when a ping arrived during read", async () => {
            let resolveFirstRead!: () => void
            const firstReadGate = new Promise<void>((resolve) => { resolveFirstRead = resolve })

            vi.mocked(readStreamSince)
                .mockImplementationOnce(async () => {
                    await firstReadGate
                    return [{ id: "1700-1", fields: {} }]
                })
                .mockResolvedValueOnce([{ id: "1700-2", fields: {} }])
                .mockResolvedValue([])

            vi.mocked(decodeEventFromStreamFields).mockReturnValue({
                accepted: true,
                value: { kind: "TRADE" } as any
            })

            const feed = new MarketFeed("TATA-INR", makeMockRedisClient() as any)
            const listener = vi.fn()
            feed.addListener(listener)

            const callA = feed.readAndFanOut()
            feed.readAndFanOut()

            resolveFirstRead()
            await callA

            expect(listener).toHaveBeenCalledTimes(2)
        })

        describe("initializeCursorWithLookback", () => {
            it("sets cursor behind now so events written before subscription are not skipped", () => {
                const feed = new MarketFeed("TATA-INR", makeMockRedisClient() as any);
                const before = Date.now();
                feed.initializeCursorWithLookback(120_000);
                const cursorTs = parseInt(feed["lastSeenEventId"].split("-")[0]!, 10);
                expect(cursorTs).toBeLessThan(before);
                expect(cursorTs).toBeGreaterThanOrEqual(before - 130_000);
            });

            it("readAndFanOut after lookback delivers event decoded from stream", async () => {
                const mockEnvelope = { market: "TATA-INR", kind: "BOOK_DELTA", bookSeq: 1n } as any;
                vi.mocked(readStreamSince).mockResolvedValue([{ id: "1700000060000-0", fields: {} }]);
                vi.mocked(decodeEventFromStreamFields).mockReturnValue({ accepted: true, value: mockEnvelope });

                const feed = new MarketFeed("TATA-INR", makeMockRedisClient() as any);
                feed.initializeCursorWithLookback(120_000);
                const listener = vi.fn();
                feed.addListener(listener);

                await feed.readAndFanOut();

                expect(listener).toHaveBeenCalledWith(mockEnvelope);
                expect(readStreamSince).toHaveBeenCalledWith(
                    expect.objectContaining({ fromId: expect.stringMatching(/^\d+-0$/) })
                );
            });
        });
    })
});
