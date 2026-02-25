export const API_URL = process.env.API_URL ?? "http://localhost:3001";
export const MARKET = process.env.MARKET ?? "TATA-INR";

const DEFAULT_MID_PRICE_BY_MARKET: Record<string, string> = {
    "TATA-INR": "75000",
    "RELIANCE-INR": "125000",
    "INFY-INR": "180000",
}

const defaultMid = DEFAULT_MID_PRICE_BY_MARKET[MARKET] ?? "75000"

export const MID_PRICE = BigInt(process.env.MID_PRICE ?? defaultMid)
export const HALF_SPREAD = BigInt(process.env.HALF_SPREAD ?? "5")
export const SPREAD_TICKS = BigInt(process.env.SPREAD_TICKS ?? "5")
export const LEVELS = Number(process.env.LEVELS ?? "8")
export const QTY_PER_LEVEL = BigInt(process.env.QTY_PER_LEVEL ?? "200")
export const REFRESH_INTERVAL_MS = Number(process.env.REFRESH_INTERVAL_MS ?? "5000")