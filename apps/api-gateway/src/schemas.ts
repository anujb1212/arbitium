import { KlineInterval } from "@arbitium/db";
import z from "zod";

const decimalBigintString = z.string().refine(
    (value) => /^[0-9]+$/.test(value) && value.length > 0 && value.length <= 36,
    { message: "Must be a non negative int string" }
).transform((value) => BigInt(value))

const boundedString = z.string().min(1).max(64)

export const PlaceLimitBodySchema = z.object({
    market: boundedString,
    orderId: z.string().uuid(),
    side: z.enum(["BUY", "SELL"]),
    price: decimalBigintString,
    qty: decimalBigintString
})

export const CancelParamsSchema = z.object({
    id: z.string().uuid()
})

export const CancelBodySchema = z.object({
    market: boundedString
})

export const TransferBodySchema = z.object({
    amountInPaise: decimalBigintString,
    idempotencyKey: boundedString,
})

export const MarketQuerySchema = z.object({
    market: z.string().min(1),
});

export const KlineQuerySchema = z.object({
    market: z.string().min(1),
    interval: z.nativeEnum(KlineInterval),
    from: z.coerce.number().int().positive(),
    to: z.coerce.number().int().positive(),
});

export const TradesQuerySchema = z.object({
    market: z.string().min(1),
    limit: z.coerce.number().int().min(1).max(200).optional(),
});

export const FillsQuerySchema = z.object({
    market: z.string().min(1),
    limit: z.coerce.number().int().min(1).max(200).optional()
});

export const OrderHistoryQuerySchema = z.object({
    market: z.string().min(1),
    limit: z.coerce.number().int().min(1).max(200).optional()
});

export const PlaceMarketBodySchema = z.object({
    market: boundedString,
    orderId: z.string().uuid(),
    side: z.enum(["BUY", "SELL"]),
    qty: decimalBigintString,
});

export type PlaceLimitBody = z.infer<typeof PlaceLimitBodySchema>
export type CancelParams = z.infer<typeof CancelParamsSchema>
export type CancelBody = z.infer<typeof CancelBodySchema>
export type TransferBody = z.infer<typeof TransferBodySchema>
export type PlaceMarketBody = z.infer<typeof PlaceMarketBodySchema>;