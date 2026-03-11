import { describe, it, expect, vi } from "vitest";
import express from "express";
import request from "supertest";

const {
    appendToStreamMock,
    encodeCommandToStreamFieldsMock,
    getRedisClientMock,
    lockBalanceForOrderMock,
    findUniqueMock,
} = vi.hoisted(() => ({
    appendToStreamMock: vi.fn().mockResolvedValue("1700000000000-0"),
    encodeCommandToStreamFieldsMock: vi.fn(() => [["kind", "PLACE_LIMIT"]]),
    getRedisClientMock: vi.fn(() => ({ sendCommand: vi.fn() })),
    lockBalanceForOrderMock: vi.fn().mockResolvedValue(undefined),
    findUniqueMock: vi.fn(),
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
            },
        },

        lockBalanceForOrder: lockBalanceForOrderMock,
        InsufficientBalanceError: class InsufficientBalanceError extends Error { },
    };
});

import { ordersRouter } from "../routes/orders"
import { beforeEach } from "node:test";

const app = express();
app.use(express.json());
app.use("/orders", ordersRouter);

beforeEach(() => {
    appendToStreamMock.mockClear();
    encodeCommandToStreamFieldsMock.mockClear();
    getRedisClientMock.mockClear();
    lockBalanceForOrderMock.mockClear();
    findUniqueMock.mockReset();

    appendToStreamMock.mockResolvedValue("1700000000000-0");
    encodeCommandToStreamFieldsMock.mockReturnValue([["kind", "PLACE_LIMIT"]]);
    getRedisClientMock.mockReturnValue({ sendCommand: vi.fn() });
    lockBalanceForOrderMock.mockResolvedValue(undefined);
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
