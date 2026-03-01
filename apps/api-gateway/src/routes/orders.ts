import { Router, Request, Response } from "express";
import { encodeCommandToStreamFields } from "@arbitium/ts-shared/engine/wire/commandCodec";
import { appendToStream } from "@arbitium/ts-engine-client/streams/appendToStream";
import { getRedisClient } from "../redis";
import {
    PlaceLimitBodySchema,
    CancelParamsSchema,
    CancelBodySchema,
} from "../schemas.js";
import type { CommandEnvelope } from "@arbitium/ts-shared/engine/types.js";
import { requireAuth } from "../middleware/auth.js";
import { resolveArbitiumUser } from "../middleware/resolveArbitiumUser.js";
import type { ArbitriumUserRequest } from "../middleware/resolveArbitiumUser.js";
import { prisma, lockBalanceForOrder, InsufficientBalanceError } from "@arbitium/db";

export const ordersRouter = Router()

const STREAM_PREFIX = "arbitium:cmd:"

ordersRouter.post("/limit", requireAuth, resolveArbitiumUser, async (req: Request, res: Response) => {
    const parsedResult = PlaceLimitBodySchema.safeParse(req.body)

    if (!parsedResult.success) {
        res.status(400).json({ error: parsedResult.error.flatten() })
        return
    }

    const { market, orderId, side, price, qty } = parsedResult.data
    const commandId = crypto.randomUUID()

    const arbitiumUserId = (req as ArbitriumUserRequest).arbitiumUserId

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
        payload: { orderId, side, price, qty }
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

    if (order.status !== "OPEN" && order.status !== "PARTIALLY_FILLED") {
        res.status(409).json({ error: "Order is not cancellable" })
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
