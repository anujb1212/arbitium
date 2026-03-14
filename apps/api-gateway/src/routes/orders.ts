import { Router, Request, Response } from "express";
import { encodeCommandToStreamFields } from "@arbitium/ts-shared/engine/wire/commandCodec";
import { appendToStream } from "@arbitium/ts-engine-client/streams/appendToStream";
import { getRedisClient } from "../redis";
import {
    PlaceLimitBodySchema,
    CancelParamsSchema,
    CancelBodySchema,
    OrderHistoryQuerySchema,
    FillsQuerySchema,
    PlaceMarketBodySchema,
} from "../schemas.js";
import type { CommandEnvelope } from "@arbitium/ts-shared/engine/types.js";
import { requireAuth } from "../middleware/auth.js";
import { resolveArbitiumUser } from "../middleware/resolveArbitiumUser.js";
import type { ArbitriumUserRequest } from "../middleware/resolveArbitiumUser.js";
import { prisma, lockBalanceForOrder, InsufficientBalanceError, queryOrderHistoryByUserAndMarket, queryFillsByUserAndMarket, lockBalanceForMarketOrder, queryHoldingsByUser, releaseLockForOrder } from "@arbitium/db";

export const ordersRouter = Router()

const STREAM_PREFIX = "arbitium:cmd:"

const KNOWN_MARKETS: Set<string> = new Set(
    (process.env.MARKETS ?? "TATA-INR,RELIANCE-INR,INFY-INR")
        .split(",")
        .map((m) => m.trim())
        .filter((m) => m.length > 0)
)

ordersRouter.get("/", requireAuth, resolveArbitiumUser, async (req: Request, res: Response) => {
    const market = req.query["market"]
    if (typeof market !== "string" || market.length === 0) {
        res.status(400).json({ error: "market query param required" })
        return
    }

    const arbitiumUserId = (req as ArbitriumUserRequest).arbitiumUserId

    const orders = await prisma.order.findMany({
        where: {
            userId: arbitiumUserId,
            market,
            status: { in: ["PENDING", "OPEN", "PARTIALLY_FILLED"] },
        },
        orderBy: { createdAt: "asc" },
        select: {
            id: true,
            commandId: true,
            side: true,
            price: true,
            qty: true,
            filledQty: true,
            status: true,
            createdAt: true,
        },
    })

    res.json({
        orders: orders.map((o) => ({
            orderId: o.id,
            commandId: o.commandId,
            side: o.side,
            price: o.price.toString(),
            qty: o.qty.toString(),
            filledQty: o.filledQty.toString(),
            status: o.status,
            createdAtMs: o.createdAt.getTime(),
        })),
    })
})

ordersRouter.post("/limit", requireAuth, resolveArbitiumUser, async (req: Request, res: Response) => {
    const parsedResult = PlaceLimitBodySchema.safeParse(req.body)

    if (!parsedResult.success) {
        res.status(400).json({ error: parsedResult.error.flatten() })
        return
    }

    const { market, orderId, side, price, qty } = parsedResult.data
    const commandId = crypto.randomUUID()

    const arbitiumUserId = (req as ArbitriumUserRequest).arbitiumUserId

    if (!KNOWN_MARKETS.has(market)) {
        res.status(422).json({ error: "Unknown market" })
        return
    }

    try {
        await lockBalanceForOrder({
            prisma,
            userId: arbitiumUserId,
            orderId,
            commandId,
            market,
            side,
            price,
            qty,
        })
    } catch (error) {
        if (error instanceof InsufficientBalanceError) {
            res.status(422).json({ error: "Insufficient trading balance" })
            return
        }
        res.status(500).json({ error: "Balance lock failed" })
        return
    }

    const command: CommandEnvelope = {
        commandId,
        market,
        kind: "PLACE_LIMIT",
        payload: {
            orderId,
            userId: arbitiumUserId,
            side,
            price,
            qty
        }
    }

    try {
        const fields = encodeCommandToStreamFields(command)
        await appendToStream({
            client: getRedisClient(),
            streamKey: `${STREAM_PREFIX}${market}`,
            fields
        })
        res.status(202).json({ commandId })
    } catch {
        await releaseLockForOrder({ prisma, orderId }).catch((releaseErr) => {
            console.error(`Stream fail — lock release error orderId=${orderId}`, releaseErr)
        })
        res.status(503).json({ error: "Command stream unavailable" })
    }
})

ordersRouter.post("/market", requireAuth, resolveArbitiumUser, async (req: Request, res: Response) => {
    const parsedResult = PlaceMarketBodySchema.safeParse(req.body);
    if (!parsedResult.success) {
        res.status(400).json({ error: parsedResult.error.flatten() });
        return;
    }

    const { market, orderId, side, qty } = parsedResult.data;
    const commandId = crypto.randomUUID();
    const arbitiumUserId = (req as ArbitriumUserRequest).arbitiumUserId;

    if (!KNOWN_MARKETS.has(market)) {
        res.status(422).json({ error: "Unknown market" })
        return
    }

    try {
        await lockBalanceForMarketOrder({
            prisma,
            userId: arbitiumUserId,
            orderId,
            commandId,
            market,
            side,
            qty
        });

    } catch (error) {
        if (error instanceof InsufficientBalanceError) {
            res.status(422).json({ error: "Insufficient trading balance" });
            return;
        }

        await releaseLockForOrder({ prisma, orderId }).catch((releaseErr) => {
            console.error(`Stream fail — lock release error orderId=${orderId}`, releaseErr)
        })

        res.status(500).json({ error: "Balance lock failed" });
        return;
    }

    const command: CommandEnvelope = {
        commandId,
        market,
        kind: "PLACE_MARKET",
        payload: {
            orderId,
            userId: arbitiumUserId,
            side,
            qty
        }
    }

    try {
        const fields = encodeCommandToStreamFields(command);
        await appendToStream({ client: getRedisClient(), streamKey: `${STREAM_PREFIX}${market}`, fields });
        res.status(202).json({ commandId });
    } catch {
        res.status(503).json({ error: "Command stream unavailable" });
    }
});

ordersRouter.get("/fills", requireAuth, resolveArbitiumUser, async (req: Request, res: Response) => {
    const parsed = FillsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const userId = (req as ArbitriumUserRequest).arbitiumUserId;
    const fills = await queryFillsByUserAndMarket({
        prisma,
        userId,
        market: parsed.data.market,
        limit: parsed.data.limit
    });
    res.json({ fills });
});

ordersRouter.get("/history", requireAuth, resolveArbitiumUser, async (req: Request, res: Response) => {
    const parsed = OrderHistoryQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const userId = (req as ArbitriumUserRequest).arbitiumUserId;
    const orders = await queryOrderHistoryByUserAndMarket({
        prisma,
        userId,
        market: parsed.data.market,
        limit: parsed.data.limit
    });
    res.json({ orders });
});

ordersRouter.delete("/:id", requireAuth, resolveArbitiumUser, async (req: Request, res: Response) => {
    const paramsResult = CancelParamsSchema.safeParse(req.params)
    const bodyResult = CancelBodySchema.safeParse(req.body)

    if (!paramsResult.success) {
        res.status(400).json({ error: paramsResult.error.flatten() })
        return
    }
    if (!bodyResult.success) {
        res.status(400).json({ error: bodyResult.error.flatten() })
        return
    }

    const { id: orderId } = paramsResult.data
    const { market } = bodyResult.data
    const arbitiumUserId = (req as ArbitriumUserRequest).arbitiumUserId

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { userId: true, status: true, market: true },
    })

    if (!order || order.userId !== arbitiumUserId) {
        res.status(404).json({ error: "Order not found" })
        return
    }

    if (order.market !== market) {
        res.status(400).json({ error: "Market mismatch" })
        return
    }

    if (order.status === "PENDING") {
        res.status(409).json({ error: "Order is not open yet" })
        return
    }

    if (order.status !== "OPEN" && order.status !== "PARTIALLY_FILLED") {
        res.status(409).json({ error: "Order is not cancellable" })
        return
    }

    if (!KNOWN_MARKETS.has(market)) {
        res.status(422).json({ error: "Unknown market" })
        return
    }

    const commandId = crypto.randomUUID()

    const command: CommandEnvelope = {
        commandId,
        market,
        kind: "CANCEL",
        payload: { orderId }
    }

    try {
        const fields = encodeCommandToStreamFields(command)
        await appendToStream({
            client: getRedisClient(),
            streamKey: `${STREAM_PREFIX}${market}`,
            fields
        })
        res.status(202).json({ commandId })
    } catch {
        res.status(503).json({ error: "Command stream unavailable" })
    }
})
