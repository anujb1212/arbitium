import z from "zod";

const decimalBigintString = z.string().refine(
    (value) => /^[0-9]+$/.test(value) && value.length > 0 && value.length <= 36,
    { message: "Must be a non negative int string" }
).transform((value) => BigInt(value))

const boundedString = z.string().min(1).max(64)

export const PlaceLimitBodySchema = z.object({
    market: boundedString,
    orderId: boundedString,
    side: z.enum(["BUY", "SELL"]),
    price: decimalBigintString,
    qty: decimalBigintString
})

export const CancelParamsSchema = z.object({
    id: boundedString
})

export const CancelBodySchema = z.object({
    market: boundedString
})

export type PlaceLimitBody = z.infer<typeof PlaceLimitBodySchema>
export type CancelParams = z.infer<typeof CancelParamsSchema>
export type CancelBody = z.infer<typeof CancelBodySchema>