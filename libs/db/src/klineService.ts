import { KlineInterval, Prisma, PrismaClient } from "../generated/prisma";

export { KlineInterval };

export type UpsertKlineArgs = {
    tx: Prisma.TransactionClient;
    market: string;
    interval: KlineInterval;
    openTime: Date;
    closeTime: Date;
    tradePrice: bigint;
    tradeQty: bigint;
};

export type KlineBarDTO = {
    openTime: number;
    closeTime: number;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
    tradeCount: number;
};

export type SparklineCandleDTO = {
    time: number;
    open: string;
    high: string;
    low: string;
    close: string;
};

export function getOpenTime(tradeTime: Date, interval: KlineInterval): Date {
    const ms = tradeTime.getTime();

    switch (interval) {
        case KlineInterval.ONE_MINUTE: return new Date(ms - (ms % 60_000));
        case KlineInterval.FIVE_MINUTES: return new Date(ms - (ms % 300_000));
        case KlineInterval.FIFTEEN_MINUTES: return new Date(ms - (ms % 900_000));
        case KlineInterval.ONE_HOUR: return new Date(ms - (ms % 3_600_000));
        case KlineInterval.ONE_DAY: return new Date(ms - (ms % 86_400_000));
    }
}

export function getCloseTime(openTime: Date, interval: KlineInterval): Date {
    switch (interval) {
        case KlineInterval.ONE_MINUTE: return new Date(openTime.getTime() + 60_000);
        case KlineInterval.FIVE_MINUTES: return new Date(openTime.getTime() + 300_000);
        case KlineInterval.FIFTEEN_MINUTES: return new Date(openTime.getTime() + 900_000);
        case KlineInterval.ONE_HOUR: return new Date(openTime.getTime() + 3_600_000);
        case KlineInterval.ONE_DAY: return new Date(openTime.getTime() + 86_400_000);
    }
}

export async function upsertKline(args: UpsertKlineArgs): Promise<void> {
    const { tx, market, interval, openTime, closeTime, tradePrice, tradeQty } = args;

    await tx.$executeRawUnsafe(
        `INSERT INTO "Kline" (market, interval, "openTime", "closeTime", open, high, low, close, volume, "tradeCount")
         VALUES ($1, $2::"KlineInterval", $3, $4, $5, $5, $5, $5, $6, 1)
         ON CONFLICT (market, interval, "openTime") DO UPDATE SET
             high = GREATEST("Kline".high, $5),
             low = LEAST("Kline".low, $5),
             close = $5,
             "closeTime" = $4,
             volume = "Kline".volume + $6,
             "tradeCount" = "Kline"."tradeCount" + 1`,
        market,
        interval,
        openTime,
        closeTime,
        tradePrice,
        tradeQty,
    );
}

export async function querySparklineCandles(
    client: Prisma.TransactionClient | PrismaClient,
    market: string,
    fromMs: number,
    toMs: number,
): Promise<SparklineCandleDTO[]> {
    const rows = await client.$queryRawUnsafe<Array<{
        bucket: Date;
        open: bigint;
        high: bigint;
        low: bigint;
        close: bigint;
    }>>(
        `SELECT
            "openTime" AS bucket,
            open,
            high,
            low,
            close
        FROM "Kline"
        WHERE market = $1
          AND interval = 'ONE_HOUR'
          AND "openTime" >= to_timestamp($2::bigint / 1000)
          AND "openTime" <= to_timestamp($3::bigint / 1000)
        ORDER BY "openTime" ASC`,
        market,
        fromMs,
        toMs,
    );

    return rows.map((r) => ({
        time: r.bucket.getTime(),
        open: r.open.toString(),
        high: r.high.toString(),
        low: r.low.toString(),
        close: r.close.toString(),
    }));
}

export async function queryBatchSparklines(
    client: Prisma.TransactionClient | PrismaClient,
    markets: string[],
    fromMs: number,
    toMs: number,
): Promise<Record<string, SparklineCandleDTO[]>> {
    const rows = await client.$queryRawUnsafe<Array<{
        market: string;
        bucket: Date;
        open: bigint;
        high: bigint;
        low: bigint;
        close: bigint;
    }>>(
        `SELECT
            market,
            "openTime" AS bucket,
            open,
            high,
            low,
            close
        FROM "Kline"
        WHERE market = ANY($1::text[])
          AND interval = 'ONE_HOUR'
          AND "openTime" >= to_timestamp($2::bigint / 1000)
          AND "openTime" <= to_timestamp($3::bigint / 1000)
        ORDER BY market, "openTime" ASC`,
        markets,
        fromMs,
        toMs,
    );

    const result: Record<string, SparklineCandleDTO[]> = {};
    for (const r of rows) {
        if (!result[r.market]) result[r.market] = [];
        result[r.market].push({
            time: r.bucket.getTime(),
            open: r.open.toString(),
            high: r.high.toString(),
            low: r.low.toString(),
            close: r.close.toString(),
        });
    }
    return result;
}
