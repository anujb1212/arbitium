import { describe, it, expect, vi, beforeEach } from "vitest";
import type { EventEnvelope } from "@arbitium/ts-shared/engine/types";

const {
    mockTradeCreate,
    mockTransaction,
    mockConsumeLockOnFill,
    mockCreditFillProceeds,
    mockReleaseLockForOrder,
} = vi.hoisted(() => {
    const mockTradeCreate = vi.fn();
    const mockTransaction = vi.fn(async (fn: (tx: unknown) => Promise<void>) => {
        await fn({ trade: { create: mockTradeCreate } });
    });
    return {
        mockTradeCreate,
        mockTransaction,
        mockConsumeLockOnFill: vi.fn().mockResolvedValue(undefined),
        mockCreditFillProceeds: vi.fn().mockResolvedValue(undefined),
        mockReleaseLockForOrder: vi.fn().mockResolvedValue(undefined),
    };
});

vi.mock("@arbitium/db", () => ({
    prisma: {
        $transaction: mockTransaction,
        order: { findUnique: vi.fn(), update: vi.fn() },
        tradingBalance: { update: vi.fn() },
    },
    consumeLockOnFill: mockConsumeLockOnFill,
    creditFillProceeds: mockCreditFillProceeds,
    releaseLockForOrder: mockReleaseLockForOrder,
}));

import { handleEvent } from "../eventHandler";

function makeTradeEvent(overrides: {
    takerSide: "BUY" | "SELL";
    takerOrderId?: string;
    makerOrderId?: string;
}): Extract<EventEnvelope, { kind: "TRADE" }> {
    return {
        market: "TATA-INR",
        kind: "TRADE",
        bookSeq: 1n,
        payload: {
            takerOrderId: overrides.takerOrderId ?? "order-taker",
            makerOrderId: overrides.makerOrderId ?? "order-maker",
            price: 100n,
            qty: 10n,
            takerSide: overrides.takerSide,
        },
    };
}

describe("handleEvent — TRADE", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockTradeCreate.mockResolvedValue({});
        mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<void>) => {
            await fn({ trade: { create: mockTradeCreate } });
        });
    });

    describe("BUY/SELL side determination", () => {
        it("should consumeLock on taker and creditProceeds on maker when takerSide is BUY", async () => {
            const event = makeTradeEvent({
                takerSide: "BUY",
                takerOrderId: "buy-order",
                makerOrderId: "sell-order",
            });

            await handleEvent(event);

            expect(mockConsumeLockOnFill).toHaveBeenCalledWith(
                expect.objectContaining({ orderId: "buy-order" })
            );
            expect(mockCreditFillProceeds).toHaveBeenCalledWith(
                expect.objectContaining({ orderId: "sell-order" })
            );
        });

        it("should consumeLock on maker and creditProceeds on taker when takerSide is SELL", async () => {
            const event = makeTradeEvent({
                takerSide: "SELL",
                takerOrderId: "sell-order",
                makerOrderId: "buy-order",
            });

            await handleEvent(event);

            expect(mockConsumeLockOnFill).toHaveBeenCalledWith(
                expect.objectContaining({ orderId: "buy-order" })
            );
            expect(mockCreditFillProceeds).toHaveBeenCalledWith(
                expect.objectContaining({ orderId: "sell-order" })
            );
        });
    });

    describe("idempotency", () => {
        it("should silently skip when trade already exists (P2002)", async () => {
            const p2002 = Object.assign(new Error("Unique constraint"), { code: "P2002" });
            mockTransaction.mockRejectedValueOnce(p2002);

            const event = makeTradeEvent({ takerSide: "BUY" });

            await expect(handleEvent(event)).resolves.toBeUndefined();
            expect(mockConsumeLockOnFill).not.toHaveBeenCalled();
            expect(mockCreditFillProceeds).not.toHaveBeenCalled();
        });

        it("should rethrow unknown errors so message stays in PEL for retry", async () => {
            const dbError = new Error("DB connection lost");
            mockTransaction.mockRejectedValueOnce(dbError);

            const event = makeTradeEvent({ takerSide: "BUY" });

            await expect(handleEvent(event)).rejects.toThrow("DB connection lost");
        });
    });
});

describe("handleEvent — BOOK_DELTA", () => {
    beforeEach(() => vi.clearAllMocks());

    it("should call releaseLockForOrder when delta type is CANCEL", async () => {
        const event: Extract<EventEnvelope, { kind: "BOOK_DELTA" }> = {
            market: "TATA-INR",
            kind: "BOOK_DELTA",
            bookSeq: 2n,
            payload: { type: "CANCEL", orderId: "order-to-cancel" },
        };

        await handleEvent(event);

        expect(mockReleaseLockForOrder).toHaveBeenCalledWith(
            expect.objectContaining({ orderId: "order-to-cancel" })
        );
    });

    it("should NOT call releaseLockForOrder for ADD delta", async () => {
        const event: Extract<EventEnvelope, { kind: "BOOK_DELTA" }> = {
            market: "TATA-INR",
            kind: "BOOK_DELTA",
            bookSeq: 3n,
            payload: { type: "ADD", orderId: "o1", side: "BUY", price: 100n, qty: 5n },
        };

        await handleEvent(event);

        expect(mockReleaseLockForOrder).not.toHaveBeenCalled();
    });
});
