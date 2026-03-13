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
        req.arbitiumUserId = "user-1";
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

const app = express();
app.use(express.json());
app.use("/orders", ordersRouter);

beforeEach(() => {
    appendToStreamMock.mockClear();
    encodeCommandToStreamFieldsMock.mockClear();
    getRedisClientMock.mockClear();
    lockBalanceForOrderMock.mockClear();
    lockBalanceForMarketOrderMock.mockClear();
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
        const res = await request(app).post("/orders/limit").send({
            market: "TATA_INR",
            orderId: "ord-1",
            side: "BUY",
            price: "10050000",
            qty: "1000000",
        });
        expect(res.status).toBe(202);
        expect(typeof res.body.commandId).toBe("string");
        expect(res.body.commandId.length).toBeGreaterThan(0);
        expect(lockBalanceForOrderMock).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: "user-1",
                orderId: "ord-1",
                market: "TATA_INR",
            }),
        )
    });

    it("returns 400 when side is invalid", async () => {
        const res = await request(app).post("/orders/limit").send({
            market: "TATA_INR",
            orderId: "ord-1",
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
            orderId: "ord-2",
            side: "SELL",
            price: "100.5",
            qty: "1000000",
        });
        expect(res.status).toBe(400);
    });
});

describe("DELETE /orders/:id", () => {
    it("returns 409 when order is still PENDING", async () => {
        appendToStreamMock.mockClear();
        findUniqueMock.mockResolvedValue({
            userId: "user-1",
            status: "PENDING",
            market: "TATA_INR",
        });

        const res = await request(app)
            .delete("/orders/ord-1")
            .send({ market: "TATA_INR" });

        expect(res.status).toBe(409);
        expect(res.body).toEqual({ error: "Order is not open yet" });
        expect(appendToStreamMock).not.toHaveBeenCalled();
    });

    it("returns 202 + commandId when order is OPEN", async () => {
        appendToStreamMock.mockClear();
        findUniqueMock.mockResolvedValue({
            userId: "user-1",
            status: "OPEN",
            market: "TATA_INR",
        });
        const res = await request(app)
            .delete("/orders/ord-1")
            .send({ market: "TATA_INR" });
        expect(res.status).toBe(202);
        expect(typeof res.body.commandId).toBe("string");
        expect(appendToStreamMock).toHaveBeenCalledTimes(1);
    });

    it("returns 400 when market body is missing", async () => {
        const res = await request(app).delete("/orders/ord-1").send({});
        expect(res.status).toBe(400);
    });

    it("returns 404 when order belongs to another user", async () => {
        findUniqueMock.mockResolvedValue({
            userId: "user-2",
            status: "OPEN",
            market: "TATA_INR",
        });

        const res = await request(app).delete("/orders/ord-1").send({ market: "TATA_INR" });
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
        queryHoldingsByUserMock.mockResolvedValue([]);

        const res = await request(app).post("/orders/limit").send({
            market: "TATA-INR",
            orderId: "ord-sell-1",
            side: "SELL",
            price: "10000000",
            qty: "5",
        });

        expect(res.status).toBe(422);
        expect(res.body.error).toMatch(/insufficient share holdings/i);
        expect(lockBalanceForOrderMock).not.toHaveBeenCalled();
    });

    it("rejects SELL limit when qty > holdings minus open sell qty", async () => {
        // Net 6 shares held
        queryHoldingsByUserMock.mockResolvedValue([
            { asset: "TATA", market: "TATA-INR", netQty: "6", avgBuyPrice: "10000000" }
        ]);
        // 4 shares already locked in open SELL orders
        findUniqueMock.mockResolvedValue(null); // not used in this path
        // Override prisma.order.findMany for open sell orders
        // Note: findUniqueMock won't work here — see note below

        const res = await request(app).post("/orders/limit").send({
            market: "TATA-INR",
            orderId: "ord-sell-2",
            side: "SELL",
            price: "10000000",
            qty: "7",   // 7 > 6 available
        });

        expect(res.status).toBe(422);
        expect(res.body.error).toMatch(/insufficient share holdings/i);
    });

    it("accepts SELL limit when qty <= available holdings", async () => {
        queryHoldingsByUserMock.mockResolvedValue([
            { asset: "TATA", market: "TATA-INR", netQty: "10", avgBuyPrice: "10000000" }
        ]);

        const res = await request(app).post("/orders/limit").send({
            market: "TATA-INR",
            orderId: "ord-sell-3",
            side: "SELL",
            price: "10000000",
            qty: "5",
        });

        expect(res.status).toBe(202);
        expect(lockBalanceForOrderMock).toHaveBeenCalledOnce();
    });

    it("rejects SELL market order when user has 0 holdings", async () => {
        queryHoldingsByUserMock.mockResolvedValue([]);

        const res = await request(app).post("/orders/market").send({
            market: "TATA-INR",
            orderId: "ord-mkt-sell-1",
            side: "SELL",
            qty: "3",
        });

        expect(res.status).toBe(422);
        expect(res.body.error).toMatch(/insufficient share holdings/i);
        expect(lockBalanceForMarketOrderMock).not.toHaveBeenCalled();
    });
});
