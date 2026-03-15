import rateLimit from "express-rate-limit";
import type { Request } from "express";
import type { ArbitriumUserRequest } from "./resolveArbitiumUser.js";

export function createUserRateLimiter(maxRequestsPerMinute: number) {
    return rateLimit({
        windowMs: 60 * 1_000,
        limit: maxRequestsPerMinute,
        keyGenerator: (req: Request): string => {
            return (req as ArbitriumUserRequest).arbitiumUserId;
        },
        standardHeaders: "draft-7",
        legacyHeaders: false,
        message: { error: "Rate limit exceeded" },
    });
}