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

export const ordersRouter = Router()

const STREAM_PREFIX = "arbitium:cmd:"

ordersRouter.post("/limit", async (req: Request, res: Response) => {
    const parsedResult = PlaceLimitBodySchema.safeParse(req.body)

    if (!parsedResult.success) {
        res.status(400).json({
            error: parsedResult.error.flatten()
        })
        return
    }

    const { market, orderId, side, price, qty } = parsedResult.data
    const commandId = crypto.randomUUID()

    const command: CommandEnvelope = {
        commandId,
        market,
        kind: "PLACE_LIMIT",
        payload: {
            orderId,
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
        res.status(503).json({ error: "Command stream unavailable" })
    }
})

ordersRouter.delete("/:id", async (req: Request, res: Response) => {
    const paramsResult = CancelParamsSchema.safeParse(req.params)
    const bodyResult = CancelBodySchema.safeParse(req.body)

    if (!paramsResult.success) {
        res.status(400).json({
            error: paramsResult.error.flatten()
        })
        return
    }
    if (!bodyResult.success) {
        res.status(400).json({
            error: bodyResult.error.flatten()
        })
        return
    }

    const { id: orderId } = paramsResult.data
    const { market } = bodyResult.data
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