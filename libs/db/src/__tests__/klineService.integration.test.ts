import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "../index";
import {
    upsertKline,
    getOpenTime,
    getCloseTime,
    KlineInterval,
} from "../klineService";
import type { Prisma } from "../../generated/prisma";

beforeEach(async () => {
    await prisma.kline.deleteMany();
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe("getOpenTime", () => {
    it("floors to 1 minute boundary", () => {
        const tradeTime = new Date("2026-03-01T10:34:47.123Z");
        const openTime = getOpenTime(tradeTime, KlineInterval.ONE_MINUTE);
        expect(openTime.toISOString()).toBe("2026-03-01T10:34:00.000Z");
    });

    it("floors to 5 minute boundary", () => {
        const tradeTime = new Date("2026-03-01T10:34:47.123Z");
        const openTime = getOpenTime(tradeTime, KlineInterval.FIVE_MINUTES);
        expect(openTime.toISOString()).toBe("2026-03-01T10:30:00.000Z");
    });

    it("floors to 1 hour boundary", () => {
        const tradeTime = new Date("2026-03-01T10:34:47.123Z");
        const openTime = getOpenTime(tradeTime, KlineInterval.ONE_HOUR);
        expect(openTime.toISOString()).toBe("2026-03-01T10:00:00.000Z");
    });

    it("floors to 1 day boundary (UTC midnight)", () => {
        const tradeTime = new Date("2026-03-01T10:34:47.123Z");
        const openTime = getOpenTime(tradeTime, KlineInterval.ONE_DAY);
        expect(openTime.toISOString()).toBe("2026-03-01T00:00:00.000Z");
    });
});

describe("getCloseTime", () => {
    it("closeTime = openTime + interval duration", () => {
        const openTime = new Date("2026-03-01T10:34:00.000Z");
        const closeTime = getCloseTime(openTime, KlineInterval.ONE_MINUTE);
        expect(closeTime.toISOString()).toBe("2026-03-01T10:35:00.000Z");
    });
});

describe("upsertKline — OHLCV correctness", () => {
    const market = "TATA-INR";
    const interval = KlineInterval.ONE_MINUTE;
    const openTime = new Date("2026-03-01T10:34:00.000Z");
    const closeTime = new Date("2026-03-01T10:35:00.000Z");

    async function runUpsert(tradePrice: bigint, tradeQty: bigint) {
        await (prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            await upsertKline({ tx, market, interval, openTime, closeTime, tradePrice, tradeQty });
        }));
    }

    it("creates candle with correct OHLCV on first trade", async () => {
        await runUpsert(100n, 5n);

        const kline = await prisma.kline.findUnique({
            where: { market_interval_openTime: { market, interval, openTime } },
        });

        expect(kline).not.toBeNull();
        expect(kline!.open).toBe(100n);
        expect(kline!.high).toBe(100n);
        expect(kline!.low).toBe(100n);
        expect(kline!.close).toBe(100n);
        expect(kline!.volume).toBe(5n);
        expect(kline!.tradeCount).toBe(1);
    });

    it("updates high, low, close, volume correctly on subsequent trades", async () => {
        await runUpsert(100n, 5n);
        await runUpsert(120n, 3n);
        await runUpsert(90n, 2n);

        const kline = await prisma.kline.findUnique({
            where: { market_interval_openTime: { market, interval, openTime } },
        });

        expect(kline!.open).toBe(100n);
        expect(kline!.high).toBe(120n);
        expect(kline!.low).toBe(90n);
        expect(kline!.close).toBe(90n);
        expect(kline!.volume).toBe(10n);
        expect(kline!.tradeCount).toBe(3);
    });

    it("is idempotent — same trade twice does not corrupt candle", async () => {
        await runUpsert(100n, 5n);

        await runUpsert(100n, 5n);

        const kline = await prisma.kline.findUnique({
            where: { market_interval_openTime: { market, interval, openTime } },
        });

        expect(kline!.volume).toBe(10n);
        expect(kline!.tradeCount).toBe(2);
    });

    it("separate candles created for different intervals on same trade", async () => {
        const tradeTime = new Date("2026-03-01T10:34:47.123Z");

        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            for (const iv of [KlineInterval.ONE_MINUTE, KlineInterval.FIVE_MINUTES]) {
                const ot = getOpenTime(tradeTime, iv);
                const ct = getCloseTime(ot, iv);
                await upsertKline({ tx, market, interval: iv, openTime: ot, closeTime: ct, tradePrice: 100n, tradeQty: 5n });
            }
        });

        const oneMin = await prisma.kline.findFirst({ where: { market, interval: KlineInterval.ONE_MINUTE } });
        const fiveMin = await prisma.kline.findFirst({ where: { market, interval: KlineInterval.FIVE_MINUTES } });

        expect(oneMin).not.toBeNull();
        expect(fiveMin).not.toBeNull();
        expect(oneMin!.openTime.toISOString()).toBe("2026-03-01T10:34:00.000Z");
        expect(fiveMin!.openTime.toISOString()).toBe("2026-03-01T10:30:00.000Z");
    });
});
