import { Router, Request, Response } from "express";
import { prisma } from "@arbitium/db";
import { getRedisClient } from "../redis";
import { MarketQuerySchema, KlineQuerySchema, TradesQuerySchema } from "../schemas";

export const marketRouter = Router();

const TRADES_DEFAULT_LIMIT = 50;

marketRouter.get("/depth", async (req: Request, res: Response) => {
    const parsed = MarketQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const { market } = parsed.data;

    const raw = await getRedisClient().sendCommand([
        "GET",
        `arbitium:depth:${market}`,
    ]) as string | null

    if (!raw) {
        res.status(404).json({ error: "No depth snapshot available" });
        return;
    }
    res.json(JSON.parse(raw));
});

marketRouter.get("/klines", async (req: Request, res: Response) => {
    const parsed = KlineQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const { market, interval, from, to } = parsed.data;
    const klines = await prisma.kline.findMany({
        where: {
            market,
            interval,
            openTime: { gte: new Date(from), lte: new Date(to) },
        },
        orderBy: { openTime: "asc" },
        select: {
            openTime: true, closeTime: true,
            open: true, high: true, low: true, close: true,
            volume: true, tradeCount: true,
        },
    });
    res.json(klines.map((k) => ({
        openTime: k.openTime.getTime(),
        closeTime: k.closeTime.getTime(),
        open: k.open.toString(),
        high: k.high.toString(),
        low: k.low.toString(),
        close: k.close.toString(),
        volume: k.volume.toString(),
        tradeCount: k.tradeCount,
    })));
});

marketRouter.get("/trades", async (req: Request, res: Response) => {
    const parsed = TradesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const { market, limit } = parsed.data;
    const trades = await prisma.trade.findMany({
        where: { market },
        orderBy: { executedAt: "desc" },
        take: limit ?? TRADES_DEFAULT_LIMIT,
        select: {
            id: true,
            price: true,
            qty: true,
            executedAt: true,
            takerSide: true
        },
    });
    res.json(trades.map((t) => ({
        id: t.id,
        price: t.price.toString(),
        qty: t.qty.toString(),
        executedAt: t.executedAt.getTime(),
        takerSide: t.takerSide
    })));
});

marketRouter.get("/ticker", async (req: Request, res: Response) => {
    const parsed = MarketQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const { market } = parsed.data;
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [agg, firstTrade, lastTrade] = await Promise.all([
        prisma.trade.aggregate({
            where: { market, executedAt: { gte: since } },
            _sum: { qty: true },
            _max: { price: true },
            _min: { price: true },
            _count: { id: true },
        }),
        prisma.trade.findFirst({
            where: { market, executedAt: { gte: since } },
            orderBy: { executedAt: "asc" },
            select: { price: true },
        }),
        prisma.trade.findFirst({
            where: { market },
            orderBy: { executedAt: "desc" },
            select: { price: true },
        }),
    ]);

    const lastPrice = lastTrade?.price ?? 0n;
    const open24h = firstTrade?.price ?? lastPrice;
    const priceChange24h = lastPrice - open24h;

    res.json({
        market,
        lastPrice: lastPrice.toString(),
        open24h: open24h.toString(),
        high24h: (agg._max.price ?? 0n).toString(),
        low24h: (agg._min.price ?? 0n).toString(),
        volume24h: (agg._sum.qty ?? 0n).toString(),
        tradeCount24h: agg._count.id,
        priceChange24h: priceChange24h.toString(),
        priceChangePct24h: open24h > 0n
            ? ((Number(priceChange24h) / Number(open24h)) * 100).toFixed(2)
            : "0.00",
    });
});
