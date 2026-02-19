export const WS_PORT = Number(process.env.WS_PORT ?? "8080")
export const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379"
export const MAX_SUBSCRIPTIONS_PER_CLIENT = 10
export const STREAM_READ_COUNT = 100
export const STREAM_READ_BLOCK_MS = 50
export const MAX_MARKET_ID_LENGTH = 64
export const API_URL = process.env.API_URL ?? "http://localhost:3001"
