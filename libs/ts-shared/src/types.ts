import { z } from "zod";

export const PriceSchema = z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Price must be a positive number"
})

export const QuantitySchema = z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Quantity must be a positive number"
})

export type Side = 'buy' | 'sell';
export type OrderType = 'limit' | 'market';

export interface Order {
    id: string;
    side: Side;
    price: string;
    size: string;
    timestamp: number;
    userId: string;
    filled: string
}

export interface Trade {
    buyOrderId: string;
    sellOrderId: string;
    price: string;
    size: string;
    timestamp: number;
    tradeId: string
}

export const OrderInputSchema = z.object({
    market: z.string().min(1),
    price: PriceSchema,
    quantity: QuantitySchema,
    side: z.enum(['buy', 'sell']),
    type: z.enum(['limit', 'market']),
    userId: z.string().min(1)
})

export type OrderInput = z.infer<typeof OrderInputSchema>