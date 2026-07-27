import "dotenv/config";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

const MM_VAULTLY_USER_ID = process.env.MM_VAULTLY_USER_ID ?? "mm-bot-1";

const MARKETS: [string, bigint][] = [
    ["NVDA-INR", 12500n],
    ["GOOGL-INR", 17500n],
    ["AAPL-INR", 22500n],
    ["MSFT-INR", 42000n],
    ["AMZN-INR", 18500n],
    ["TSM-INR", 16500n],
    ["AVGO-INR", 10500n],
    ["META-INR", 9500n],
];

const ASSET_QTY_PER_MARKET = 100_000_000n;
const INR_BALANCE = 1_000_000_00n;

const SEED_CHART_MARKETS = ["NVDA-INR", "GOOGL-INR", "AAPL-INR"];
const CHART_HOURS = 6;
const TRADES_PER_HOUR = 30;
const TOTAL_TRADES = CHART_HOURS * TRADES_PER_HOUR;

function assetFromMarket(market: string): string {
    return market.split("-")[0] ?? market;
}

function getOpenTime(tradeTime: Date, intervalMinutes: number): Date {
    const ms = tradeTime.getTime();
    const bucketMs = intervalMinutes * 60_000;
    return new Date(ms - (ms % bucketMs));
}

function getCloseTime(openTime: Date, intervalMinutes: number): Date {
    return new Date(openTime.getTime() + intervalMinutes * 60_000);
}

const KLINE_INTERVALS = [
    { label: "ONE_MINUTE", minutes: 1 },
    { label: "FIVE_MINUTES", minutes: 5 },
    { label: "FIFTEEN_MINUTES", minutes: 15 },
    { label: "ONE_HOUR", minutes: 60 },
    { label: "ONE_DAY", minutes: 1440 },
] as const;

function generatePricePath(basePrice: bigint, steps: number): bigint[] {
    const prices: bigint[] = [basePrice];
    const maxMove = basePrice * 3n / 1000n; // 0.3% per step
    let current = basePrice;
    let trend = 0n;

    for (let i = 1; i < steps; i++) {
        const noise = BigInt(Math.floor(Math.random() * 21) - 10);
        const directional = BigInt(Math.floor(Math.random() * 11) - 5);
        trend = trend / 2n + directional;

        const change = (noise + trend) * maxMove / 30n;
        current = current + change;
        if (current < basePrice * 85n / 100n) current = basePrice * 85n / 100n;
        if (current > basePrice * 115n / 100n) current = basePrice * 115n / 100n;
        prices.push(current);
    }
    return prices;
}

async function seedChartData(
    mmUserId: string,
    counterpartyUserId: string,
    market: string,
    basePrice: bigint,
): Promise<void> {
    const asset = assetFromMarket(market);
    const now = Date.now();
    const startMs = now - CHART_HOURS * 3600_000;
    const stepMs = (CHART_HOURS * 3600_000) / TOTAL_TRADES;

    const prices = generatePricePath(basePrice, TOTAL_TRADES);

    for (let i = 0; i < TOTAL_TRADES; i++) {
        const ts = new Date(startMs + i * stepMs);
        const price = prices[i];
        const qty = BigInt(1 + Math.floor(Math.random() * 5));
        const takerSide = Math.random() > 0.5 ? "BUY" : "SELL";

        const makerId = `seed-maker-${market}-${i}`;
        const takerId = `seed-taker-${market}-${i}`;

        await prisma.order.upsert({
            where: { commandId: `seed-cmd-maker-${market}-${i}` },
            update: {},
            create: {
                id: makerId,
                userId: mmUserId,
                commandId: `seed-cmd-maker-${market}-${i}`,
                market,
                side: takerSide === "BUY" ? "SELL" : "BUY",
                price,
                qty,
                filledQty: qty,
                lockedAmount: 0n,
                consumedLocked: 0n,
                status: "FILLED",
                createdAt: ts,
                updatedAt: ts,
            },
        });

        await prisma.order.upsert({
            where: { commandId: `seed-cmd-taker-${market}-${i}` },
            update: {},
            create: {
                id: takerId,
                userId: counterpartyUserId,
                commandId: `seed-cmd-taker-${market}-${i}`,
                market,
                side: takerSide as "BUY" | "SELL",
                price,
                qty,
                filledQty: qty,
                lockedAmount: 0n,
                consumedLocked: 0n,
                status: "FILLED",
                createdAt: ts,
                updatedAt: ts,
            },
        });

        try {
            await prisma.trade.create({
                data: {
                    market,
                    makerOrderId: makerId,
                    takerOrderId: takerId,
                    price,
                    qty,
                    takerSide: takerSide as "BUY" | "SELL",
                    executedAt: ts,
                },
            });
        } catch (e: unknown) {
            if ((e as { code?: string }).code !== "P2002") throw e;
        }
    }

    // Build klines from the price path
    for (const interval of KLINE_INTERVALS) {
        const bucketMap = new Map<
            number,
            { open: bigint; high: bigint; low: bigint; close: bigint; volume: bigint; count: number; openTime: Date; closeTime: Date }
        >();

        for (let i = 0; i < TOTAL_TRADES; i++) {
            const ts = new Date(startMs + i * stepMs);
            const price = prices[i];
            const qty = BigInt(1 + Math.floor(Math.random() * 5));
            const openTime = getOpenTime(ts, interval.minutes);
            const closeTime = getCloseTime(openTime, interval.minutes);
            const key = openTime.getTime();

            const existing = bucketMap.get(key);
            if (!existing) {
                bucketMap.set(key, {
                    open: price,
                    high: price,
                    low: price,
                    close: price,
                    volume: qty,
                    count: 1,
                    openTime,
                    closeTime,
                });
            } else {
                if (price > existing.high) existing.high = price;
                if (price < existing.low) existing.low = price;
                existing.close = price;
                existing.volume = existing.volume + qty;
                existing.count = existing.count + 1;
            }
        }

        for (const [, bucket] of bucketMap) {
            try {
                await prisma.$executeRawUnsafe(
                    `INSERT INTO "Kline" (market, interval, "openTime", "closeTime", open, high, low, close, volume, "tradeCount")
                     VALUES ($1, $2::"KlineInterval", $3, $4, $5, $6, $7, $8, $9, $10)
                     ON CONFLICT (market, interval, "openTime") DO UPDATE SET
                     high = GREATEST("Kline".high, $6),
                     low = LEAST("Kline".low, $7),
                     close = $8,
                     "closeTime" = $4,
                     volume = "Kline".volume + $9,
                     "tradeCount" = "Kline"."tradeCount" + $10`,
                    market,
                    interval.label,
                    bucket.openTime,
                    bucket.closeTime,
                    bucket.open,
                    bucket.high,
                    bucket.low,
                    bucket.close,
                    bucket.volume,
                    bucket.count,
                );
            } catch {
                // skip if insert fails
            }
        }
    }

    console.log(`Chart data seeded: ${market} — ${TOTAL_TRADES} trades, klines for all intervals`);
}

async function main(): Promise<void> {
    const mmUser = await prisma.user.upsert({
        where: { vaultlyUserId: MM_VAULTLY_USER_ID },
        update: {},
        create: { vaultlyUserId: MM_VAULTLY_USER_ID, email: "mm@arbitium.internal" },
    });
    console.log(`Market maker user: ${mmUser.id} (vaultly: ${MM_VAULTLY_USER_ID})`);

    await prisma.tradingBalance.upsert({
        where: { userId: mmUser.id },
        update: { available: INR_BALANCE },
        create: { userId: mmUser.id, available: INR_BALANCE, locked: 0n },
    });
    console.log(`MM INR balance seeded: ${INR_BALANCE}`);

    for (const [market] of MARKETS) {
        const asset = assetFromMarket(market);
        await prisma.assetBalance.upsert({
            where: { userId_market: { userId: mmUser.id, market } },
            update: { available: ASSET_QTY_PER_MARKET },
            create: {
                userId: mmUser.id,
                market,
                asset,
                available: ASSET_QTY_PER_MARKET,
                locked: 0n,
            },
        });
        console.log(`MM AssetBalance seeded: ${market} asset=${asset} qty=${ASSET_QTY_PER_MARKET}`);
    }

    const counterpartyUser = await prisma.user.upsert({
        where: { vaultlyUserId: "chart-seed-counterparty" },
        update: {},
        create: { vaultlyUserId: "chart-seed-counterparty", email: "chart@arbitium.internal" },
    });
    await prisma.tradingBalance.upsert({
        where: { userId: counterpartyUser.id },
        update: {},
        create: { userId: counterpartyUser.id, available: 0n, locked: 0n },
    });
    console.log(`Counterparty user: ${counterpartyUser.id}`);

    for (const market of SEED_CHART_MARKETS) {
        const [, price] = MARKETS.find(([m]) => m === market) ?? [market, 10000n];
        await seedChartData(mmUser.id, counterpartyUser.id, market, price);
    }

    console.log("Seed complete.");
}

main()
    .catch((err) => {
        console.error("Seed failed:", err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
