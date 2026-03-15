import { describe, it, expect, vi } from "vitest";
import express from "express";
import request from "supertest";

const {
    appendToStreamMock,
    encodeCommandToStreamFieldsMock,
    getRedisClientMock,
    lockBalanceForOrderMock,
    lockBalanceForMarketOrderMock,
    queryHoldingsByUserMock,
    findUniqueMock,
    queryFillsByUserAndMarketMock,
    queryOrderHistoryByUserAndMarketMock
} = vi.hoisted(() => ({
    appendToStreamMock: vi.fn().mockResolvedValue("1700000000000-0"),
    encodeCommandToStreamFieldsMock: vi.fn(() => [["kind", "PLACE_LIMIT"]]),
    getRedisClientMock: vi.fn(() => ({ sendCommand: vi.fn() })),
    lockBalanceForOrderMock: vi.fn().mockResolvedValue(undefined),
    lockBalanceForMarketOrderMock: vi.fn().mockResolvedValue(undefined),
    queryHoldingsByUserMock: vi.fn().mockResolvedValue([]),
    findUniqueMock: vi.fn(),
    queryFillsByUserAndMarketMock: vi.fn().mockResolvedValue([]),
    queryOrderHistoryByUserAndMarketMock: vi.fn().mockResolvedValue([])
}));

vi.mock("../middleware/auth.js", () => ({
    requireAuth: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

vi.mock("../middleware/resolveArbitiumUser.js", () => ({
    resolveArbitiumUser: (req: Record<string, unknown>, _res: unknown, next: () => void) => {
        const expressReq = req as { headers?: Record<string, string> };
        req.arbitiumUserId = expressReq.headers?.["x-test-user-id"] ?? "user-1";
        next();
    },
}));

vi.mock("@arbitium/ts-engine-client/streams/appendToStream", () => ({
    appendToStream: appendToStreamMock
}));
vi.mock("@arbitium/ts-shared/engine/wire/commandCodec", () => ({
    encodeCommandToStreamFields: encodeCommandToStreamFieldsMock
}));

vi.mock("../redis", () => ({
    getRedisClient: getRedisClientMock,
}));

vi.mock("@arbitium/db", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@arbitium/db")>();
    return {
        ...actual,
        prisma: {
            order: {
                findUnique: findUniqueMock,
                findMany: vi.fn().mockResolvedValue([]),
            },
        },

        lockBalanceForOrder: lockBalanceForOrderMock,
        lockBalanceForMarketOrder: lockBalanceForMarketOrderMock,
        queryHoldingsByUser: queryHoldingsByUserMock,
        InsufficientBalanceError: class InsufficientBalanceError extends Error { },
        queryFillsByUserAndMarket: queryFillsByUserAndMarketMock,
        queryOrderHistoryByUserAndMarket: queryOrderHistoryByUserAndMarketMock
    };
});

import { ordersRouter } from "../routes/orders"
import { beforeEach } from "vitest";
import { InsufficientBalanceError } from "@arbitium/db";

const app = express();
app.use(express.json());
app.use("/orders", ordersRouter);

beforeEach(() => {
    appendToStreamMock.mockClear();
    encodeCommandToStreamFieldsMock.mockClear();
    getRedisClientMock.mockClear();
    lockBalanceForOrderMock.mockReset();
    lockBalanceForMarketOrderMock.mockReset();
    queryHoldingsByUserMock.mockReset();
    findUniqueMock.mockReset();
    queryFillsByUserAndMarketMock.mockReset();
    queryOrderHistoryByUserAndMarketMock.mockReset();

    appendToStreamMock.mockResolvedValue("1700000000000-0");
    encodeCommandToStreamFieldsMock.mockReturnValue([["kind", "PLACE_LIMIT"]]);
    getRedisClientMock.mockReturnValue({ sendCommand: vi.fn() });
    lockBalanceForOrderMock.mockResolvedValue(undefined);
    lockBalanceForMarketOrderMock.mockResolvedValue(undefined);
    queryHoldingsByUserMock.mockResolvedValue([]);
    queryFillsByUserAndMarketMock.mockResolvedValue([]);
    queryOrderHistoryByUserAndMarketMock.mockResolvedValue([]);
});

describe("POST /orders/limit", () => {
    it("returns 202 + commandId on valid body", async () => {
        const orderId = crypto.randomUUID();
        const res = await request(app).post("/orders/limit").send({
            market: "TATA-INR",
            orderId,
            side: "BUY",
            price: "10050000",
            qty: "1000000",
        });
        console.log("DEBUG body:", res.body);
        expect(res.status).toBe(202);
        expect(typeof res.body.commandId).toBe("string");
        expect(res.body.commandId.length).toBeGreaterThan(0);
        expect(lockBalanceForOrderMock).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: "user-1",
                orderId,
                market: "TATA-INR",
            }),
        )
    });

    it("returns 400 when side is invalid", async () => {
        const res = await request(app).post("/orders/limit").send({
            market: "TATA_INR",
            orderId: crypto.randomUUID(),
            side: "LONG",
            price: "10050000",
            qty: "1000000",
        });
        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });

    it("returns 400 when price is a float string", async () => {
        const res = await request(app).post("/orders/limit").send({
            market: "TATA_INR",
            orderId: crypto.randomUUID(),
            side: "SELL",
            price: "100.5",
            qty: "1000000",
        });
        expect(res.status).toBe(400);
    });
});

describe("DELETE /orders/:id", () => {
    it("returns 409 when order is still PENDING", async () => {
        const orderId = crypto.randomUUID();
        appendToStreamMock.mockClear();
        findUniqueMock.mockResolvedValue({
            userId: "user-1",
            status: "PENDING",
            market: "TATA-INR",
        });

        const res = await request(app)
            .delete(`/orders/${orderId}`)
            .send({ market: "TATA-INR" });

        expect(res.status).toBe(409);
        expect(res.body).toEqual({ error: "Order is not open yet" });
        expect(appendToStreamMock).not.toHaveBeenCalled();
    });

    it("returns 202 + commandId when order is OPEN", async () => {
        const orderId = crypto.randomUUID();
        appendToStreamMock.mockClear();
        findUniqueMock.mockResolvedValue({
            userId: "user-1",
            status: "OPEN",
            market: "TATA-INR",
        });
        const res = await request(app)
            .delete(`/orders/${orderId}`)
            .send({ market: "TATA-INR" });
        expect(res.status).toBe(202);
        expect(typeof res.body.commandId).toBe("string");
        expect(appendToStreamMock).toHaveBeenCalledTimes(1);
    });

    it("returns 400 when market body is missing", async () => {
        const res = await request(app).delete(`/orders/${crypto.randomUUID()}`).send({});
        expect(res.status).toBe(400);
    });

    it("returns 404 when order belongs to another user", async () => {
        const orderId = crypto.randomUUID();
        findUniqueMock.mockResolvedValue({
            userId: "user-2",
            status: "OPEN",
            market: "TATA-INR",
        });

        const res = await request(app)
            .delete(`/orders/${orderId}`)
            .send({ market: "TATA-INR" });
        expect(res.status).toBe(404);
    });
});

describe("GET /orders/fills", () => {
    it("returns 200 + fills array for valid market query", async () => {
        const fakeFill = {
            id: "trade-1",
            market: "TATA_INR",
            side: "SELL",
            price: "100",
            qty: "5",
            role: "MAKER",
            executedAtMs: 1700000000000,
        };
        queryFillsByUserAndMarketMock.mockResolvedValue([fakeFill]);

        const res = await request(app).get("/orders/fills?market=TATA_INR");

        expect(res.status).toBe(200);
        expect(res.body.fills).toHaveLength(1);
        expect(res.body.fills[0].role).toBe("MAKER");
        expect(queryFillsByUserAndMarketMock).toHaveBeenCalledWith(
            expect.objectContaining({ userId: "user-1", market: "TATA_INR" })
        );
    });

    it("returns 200 + empty array when user has no fills", async () => {
        queryFillsByUserAndMarketMock.mockResolvedValue([]);

        const res = await request(app).get("/orders/fills?market=TATA_INR");

        expect(res.status).toBe(200);
        expect(res.body.fills).toEqual([]);
    });

    it("returns 400 when market query param is missing", async () => {
        const res = await request(app).get("/orders/fills");

        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
        expect(queryFillsByUserAndMarketMock).not.toHaveBeenCalled();
    });
});

describe("GET /orders/history", () => {
    it("returns 200 + orders array for valid market query", async () => {
        const fakeOrder = {
            orderId: "ord-1",
            market: "TATA_INR",
            side: "BUY",
            price: "100",
            qty: "5",
            filledQty: "5",
            status: "FILLED",
            createdAtMs: 1700000000000,
        };
        queryOrderHistoryByUserAndMarketMock.mockResolvedValue([fakeOrder]);

        const res = await request(app).get("/orders/history?market=TATA_INR");

        expect(res.status).toBe(200);
        expect(res.body.orders).toHaveLength(1);
        expect(res.body.orders[0].status).toBe("FILLED");
        expect(queryOrderHistoryByUserAndMarketMock).toHaveBeenCalledWith(
            expect.objectContaining({ userId: "user-1", market: "TATA_INR" })
        );
    });

    it("returns 400 when market query param is missing", async () => {
        const res = await request(app).get("/orders/history");

        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
        expect(queryOrderHistoryByUserAndMarketMock).not.toHaveBeenCalled();
    });
});

describe("SELL holdings validation", () => {
    it("rejects SELL limit order when user has 0 holdings", async () => {
        await lockBalanceForOrderMock.mockRejectedValueOnce(
            new InsufficientBalanceError("Insufficient share holdings: available=0 required=5")
        );

        const res = await request(app).post("/orders/limit").send({
            market: "TATA-INR",
            orderId: crypto.randomUUID(),
            side: "SELL",
            price: "10000000",
            qty: "5",
        });

        expect(res.status).toBe(422);
        expect(res.body.error).toMatch(/insufficient share holdings/i);
        expect(lockBalanceForOrderMock).toHaveBeenCalledOnce();
    });

    it("rejects SELL limit when qty > holdings minus open sell qty", async () => {
        lockBalanceForOrderMock.mockRejectedValueOnce(
            new InsufficientBalanceError("Insufficient share holdings: available=6 required=7")
        );

        const res = await request(app).post("/orders/limit").send({
            market: "TATA-INR",
            orderId: crypto.randomUUID(),
            side: "SELL",
            price: "10000000",
            qty: "7",   // 7 > 6 available
        });

        expect(res.status).toBe(422);
        expect(res.body.error).toMatch(/insufficient share holdings/i);
    });

    it("accepts SELL limit when qty <= available holdings", async () => {
        const res = await request(app).post("/orders/limit").send({
            market: "TATA-INR",
            orderId: crypto.randomUUID(),
            side: "SELL",
            price: "10000000",
            qty: "5",
        });

        expect(res.status).toBe(202);
        expect(lockBalanceForOrderMock).toHaveBeenCalledOnce();
    });

    it("rejects SELL market order when user has 0 holdings", async () => {
        lockBalanceForMarketOrderMock.mockRejectedValueOnce(
            new InsufficientBalanceError("Insufficient share holdings: available=0 required=3")
        );

        const res = await request(app).post("/orders/market").send({
            market: "TATA-INR",
            orderId: crypto.randomUUID(),
            side: "SELL",
            qty: "3",
        });

        expect(res.status).toBe(422);
        expect(res.body.error).toMatch(/insufficient share holdings/i);
        expect(lockBalanceForMarketOrderMock).toHaveBeenCalledOnce();
    });
});

describe("Rate limiting — per arbitiumUserId", () => {
    const validLimitPayload = {
        market: "TATA-INR",
        side: "BUY",
        price: "10050000",
        qty: "1000000",
    };

    it("POST /orders/limit blocks on the 21st request for same user", async () => {
        const rateLimitUserId = `rl-limit-${crypto.randomUUID()}`;
        const responses: number[] = [];

        for (let requestIndex = 0; requestIndex < 21; requestIndex++) {
            const response = await request(app)
                .post("/orders/limit")
                .set("x-test-user-id", rateLimitUserId)
                .send({ ...validLimitPayload, orderId: `ord-rl-${requestIndex}` });
            responses.push(response.status);
        }

        expect(responses.slice(0, 20).every((status) => status !== 429)).toBe(true);
        expect(responses[20]).toBe(429);
    });

    it("DELETE /orders/:id blocks on the 41st request for same user", async () => {
        const rateLimitUserId = `rl-delete-${crypto.randomUUID()}`;
        findUniqueMock.mockResolvedValue({
            userId: rateLimitUserId,
            status: "OPEN",
            market: "TATA-INR",
        });

        const responses: number[] = [];
        for (let requestIndex = 0; requestIndex < 41; requestIndex++) {
            const response = await request(app)
                .delete("/orders/some-order-id")
                .set("x-test-user-id", rateLimitUserId)
                .send({ market: "TATA-INR" });
            responses.push(response.status);
        }

        expect(responses.slice(0, 40).every((status) => status !== 429)).toBe(true);
        expect(responses[40]).toBe(429);
    });

    it("rate limit counters are isolated — user-B not blocked when user-A hits limit", async () => {
        const userA = `rl-a-${crypto.randomUUID()}`;
        const userB = `rl-b-${crypto.randomUUID()}`;

        for (let requestIndex = 0; requestIndex < 20; requestIndex++) {
            await request(app)
                .post("/orders/limit")
                .set("x-test-user-id", userA)
                .send({ ...validLimitPayload, orderId: `ord-a-${requestIndex}` });
        }

        const response = await request(app)
            .post("/orders/limit")
            .set("x-test-user-id", userB)
            .send({ ...validLimitPayload, orderId: "ord-b-0" });

        expect(response.status).not.toBe(429);
    });
});
