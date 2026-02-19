export const API_URL = process.env.API_URL ?? "http://localhost:3000";
export const MARKET = process.env.MARKET ?? "TATA-INR";

export const MID_PRICE = BigInt(process.env.MID_PRICE ?? "10000000");
export const SPREAD_TICKS = BigInt(process.env.SPREAD_TICKS ?? "100");
export const LEVELS = Number(process.env.LEVELS ?? "5");
export const QTY_PER_LEVEL = BigInt(process.env.QTY_PER_LEVEL ?? "1000000");
export const REFRESH_INTERVAL_MS = Number(process.env.REFRESH_INTERVAL_MS ?? "2000");
