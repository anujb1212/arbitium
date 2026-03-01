import { KlineInterval, Prisma } from "../generated/prisma";

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

    const existing = await tx.kline.findUnique({
        where: { market_interval_openTime: { market, interval, openTime } },
    });

    if (!existing) {
        await tx.kline.create({
            data: {
                market,
                interval,
                openTime,
                closeTime,
                open: tradePrice,
                high: tradePrice,
                low: tradePrice,
                close: tradePrice,
                volume: tradeQty,
                tradeCount: 1,
            },
        });
        return;
    }

    await tx.kline.update({
        where: { market_interval_openTime: { market, interval, openTime } },
        data: {
            high: existing.high > tradePrice ? existing.high : tradePrice,
            low: existing.low < tradePrice ? existing.low : tradePrice,
            close: tradePrice,
            volume: { increment: tradeQty },
            tradeCount: { increment: 1 },
        },
    });
}
