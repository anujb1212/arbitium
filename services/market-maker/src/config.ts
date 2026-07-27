import "dotenv/config"

export const API_URL = process.env.API_URL ?? "http://localhost:3002";
export const MM_JWT_TOKEN = process.env.MM_JWT_TOKEN ?? "";

const DEFAULT_MID_PRICE_BY_MARKET: Record<string, string> = {
    "NVDA-INR": "12500",
    "GOOGL-INR": "17500",
    "AAPL-INR": "22500",
    "MSFT-INR": "42000",
    "AMZN-INR": "18500",
    "TSM-INR": "16500",
    "AVGO-INR": "10500",
    "META-INR": "9500",
    "TSLA-INR": "11500",
    "005930.KS-INR": "5500",
    "000660.KS-INR": "8500",
    "TCEHY-INR": "4500",
    "ASML-INR": "9500",
    "MU-INR": "6500",
    "ORCL-INR": "14000",
    "AMD-INR": "8500",
    "NFLX-INR": "65000",
    "PLTR-INR": "7500",
    "CSCO-INR": "5500",
    "BABA-INR": "7500",
    "LRCX-INR": "6500",
    "INTC-INR": "2500",
    "AMAT-INR": "6500",
    "KLAC-INR": "9500",
    "IBM-INR": "11500",
    "ANET-INR": "16500",
    "TXN-INR": "18500",
    "ARM-INR": "12500",
    "SAP-INR": "22500",
    "ADI-INR": "22500",
};

export const MARKETS = (process.env.MARKETS ?? "NVDA-INR,GOOGL-INR,AAPL-INR,MSFT-INR,AMZN-INR,TSM-INR,AVGO-INR,META-INR").split(",").map((m) => m.trim()).filter(Boolean);

export function getMidPrice(market: string): bigint {
    const envKey = midPriceEnvKey(market);
    return BigInt(process.env[envKey] ?? DEFAULT_MID_PRICE_BY_MARKET[market] ?? "10000");
}

function midPriceEnvKey(market: string): string {
    return `MID_PRICE_${market.replace(/[.-]/g, "_").toUpperCase()}`;
}

export const HALF_SPREAD = BigInt(process.env.HALF_SPREAD ?? "5");
export const SPREAD_TICKS = BigInt(process.env.SPREAD_TICKS ?? "5");
export const LEVELS = Number(process.env.LEVELS ?? "8");
export const QTY_PER_LEVEL = BigInt(process.env.QTY_PER_LEVEL ?? "200");
export const REFRESH_INTERVAL_MS = Number(process.env.REFRESH_INTERVAL_MS ?? "5000");
export const BATCH_SIZE = Number(process.env.BATCH_SIZE ?? "5");
