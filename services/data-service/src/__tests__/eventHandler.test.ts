import { describe, it, expect, vi, beforeEach } from "vitest";
import type { EventEnvelope } from "@arbitium/ts-shared/engine/types";

const {
    mockTradeCreate,
    mockTransaction,
    mockConsumeLockOnFill,
    mockCreditFillProceeds,
    mockReleaseLockForOrder,
    mockMarkOrderOpen,
    mockSettleMarketOrder,
    mockUpsertKline,
    mockOrderUpdate,
    mockOrderFindUnique
} = vi.hoisted(() => {
    const mockTradeCreate = vi.fn();
    const mockOrderUpdate = vi.fn().mockResolvedValue({});
    const mockOrderFindUnique = vi.fn().mockResolvedValue(null);
    const mockTransaction = vi.fn(async (fn: (tx: unknown) => Promise<void>) => {
        await fn({
            trade: { create: mockTradeCreate },
            order: { findUnique: mockOrderFindUnique, update: mockOrderUpdate },
            tradingBalance: { update: vi.fn(), updateMany: vi.fn() },
        });
    });
    return {
        mockTradeCreate,
        mockTransaction,
        mockOrderUpdate,
        mockOrderFindUnique,
        mockConsumeLockOnFill: vi.fn().mockResolvedValue(undefined),
        mockCreditFillProceeds: vi.fn().mockResolvedValue(undefined),
        mockReleaseLockForOrder: vi.fn().mockResolvedValue(undefined),
        mockMarkOrderOpen: vi.fn().mockResolvedValue(undefined),
        mockSettleMarketOrder: vi.fn().mockResolvedValue(undefined),
        mockUpsertKline: vi.fn().mockResolvedValue(undefined),
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
    markOrderOpen: mockMarkOrderOpen,
    settleMarketOrder: mockSettleMarketOrder,
    upsertKline: mockUpsertKline,
    getOpenTime: vi.fn((date: Date) => date),
    getCloseTime: vi.fn((date: Date) => date),
    KlineInterval: {
        ONE_MINUTE: "ONE_MINUTE",
        FIVE_MINUTES: "FIVE_MINUTES",
        FIFTEEN_MINUTES: "FIFTEEN_MINUTES",
        ONE_HOUR: "ONE_HOUR",
        ONE_DAY: "ONE_DAY",
    },
}));

import { handleEvent } from "../eventHandler";
import { prisma } from "@arbitium/db";

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
            executedAtMs: 1700000000000
        },
    };
}

describe("handleEvent — TRADE", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockTradeCreate.mockResolvedValue({});
        mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<void>) => {
            await fn({
                trade: { create: mockTradeCreate },
                order: { findUnique: mockOrderFindUnique, update: mockOrderUpdate },
                tradingBalance: { update: vi.fn(), updateMany: vi.fn() },
            });
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
            payload: {
                type: "CANCEL",
                orderId: "order-to-cancel",
                side: "BUY",
                price: 100n,
                qty: 5n
            },
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

describe("handleEvent — COMMAND_REJECTED", () => {
    beforeEach(() => vi.clearAllMocks());

    it("releases lock and sets REJECTED status atomically for PLACE_MARKET rejection", async () => {
        (prisma.order.findUnique as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            id: "order-123",
            status: "PENDING",
        });

        mockOrderFindUnique.mockResolvedValueOnce({
            id: "order-123",
            userId: "user-1",
            status: "PENDING",
            lockedAmount: 0n,
            consumedLocked: 0n,
        });

        const event: Extract<EventEnvelope, { kind: "COMMAND_REJECTED" }> = {
            market: "TATA-INR",
            kind: "COMMAND_REJECTED",
            commandId: "cmd-abc",
            payload: { commandKind: "PLACE_MARKET", rejectReason: "NO_LIQUIDITY" },
        };

        await handleEvent(event);

        expect(mockTransaction).toHaveBeenCalledOnce();
        expect(mockReleaseLockForOrder).toHaveBeenCalledWith(
            expect.objectContaining({ orderId: "order-123" })
        );
    });

    it("skips processing when commandId is missing", async () => {
        const event: Extract<EventEnvelope, { kind: "COMMAND_REJECTED" }> = {
            market: "TATA-INR",
            kind: "COMMAND_REJECTED",
            payload: { commandKind: "PLACE_MARKET", rejectReason: "NO_LIQUIDITY" },
        };

        await handleEvent(event);

        expect(mockReleaseLockForOrder).not.toHaveBeenCalled();
    });

    it("skips OPEN orders — already processing, lock not double-released", async () => {
        (prisma.order.findUnique as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            id: "order-open",
            status: "OPEN",
        });

        const event: Extract<EventEnvelope, { kind: "COMMAND_REJECTED" }> = {
            market: "TATA-INR",
            kind: "COMMAND_REJECTED",
            commandId: "cmd-open",
            payload: { commandKind: "PLACE_LIMIT", rejectReason: "DUPLICATE_ORDER_ID" },
        };

        await handleEvent(event);

        expect(mockReleaseLockForOrder).not.toHaveBeenCalled();
    });
});
