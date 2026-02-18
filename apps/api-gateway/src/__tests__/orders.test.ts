import { describe, it, expect, vi } from "vitest";
import express from "express";
import request from "supertest";
import { ordersRouter } from "../routes/orders";

vi.mock("@arbitium/ts-engine-client/streams/appendToStream", () => ({
    appendToStream: vi.fn().mockResolvedValue("1700000000000-0"),
}));
vi.mock("@arbitium/ts-shared/engine/wire/commandCodec", () => ({
    encodeCommandToStreamFields: vi.fn(() => [["kind", "PLACE_LIMIT"]]),
}));

const app = express();
app.use(express.json());
app.use("/orders", ordersRouter);

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
    it("returns 202 + commandId on valid params+body", async () => {
        const res = await request(app)
            .delete("/orders/ord-1")
            .send({ market: "TATA_INR" });
        expect(res.status).toBe(202);
        expect(typeof res.body.commandId).toBe("string");
    });

    it("returns 400 when market body is missing", async () => {
        const res = await request(app).delete("/orders/ord-1").send({});
        expect(res.status).toBe(400);
    });
});
