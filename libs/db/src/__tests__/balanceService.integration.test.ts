import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "../index";
import {
    lockBalanceForOrder,
    consumeLockOnFill,
    creditFillProceeds,
    releaseLockForOrder,
    InsufficientBalanceError,
} from "../balanceService";
import type { Prisma } from "../../generated/prisma";

beforeEach(async () => {
    await prisma.trade.deleteMany();
    await prisma.order.deleteMany();
    await prisma.tradingBalance.deleteMany();
    await prisma.balanceTransfer.deleteMany();
    await prisma.user.deleteMany();
});

afterAll(async () => {
    await prisma.$disconnect();
});


async function createUserWithBalance(vaultlyUserId: string, available: bigint) {
    const user = await prisma.user.create({
        data: { vaultlyUserId },
    });
    await prisma.tradingBalance.create({
        data: { userId: user.id, available, locked: 0n },
    });
    return user;
}

describe("lockBalanceForOrder", () => {
    it("locks correct amount and creates order for BUY side", async () => {
        const user = await createUserWithBalance("vaultly-user-1", 1000n);

        await lockBalanceForOrder({
            prisma,
            userId: user.id,
            orderId: "order-1",
            commandId: "cmd-1",
            market: "TATA-INR",
            side: "BUY",
            price: 100n,
            qty: 5n,
        });

        const balance = await prisma.tradingBalance.findUnique({ where: { userId: user.id } });
        expect(balance!.available).toBe(500n);
        expect(balance!.locked).toBe(500n);

        const order = await prisma.order.findUnique({ where: { id: "order-1" } });
        expect(order!.status).toBe("OPEN");
        expect(order!.lockedAmount).toBe(500n);
    });

    it("locks 0n for SELL side — no INR deducted", async () => {
        const user = await createUserWithBalance("vaultly-user-2", 1000n);

        await lockBalanceForOrder({
            prisma,
            userId: user.id,
            orderId: "order-sell-1",
            commandId: "cmd-sell-1",
            market: "TATA-INR",
            side: "SELL",
            price: 100n,
            qty: 5n,
        });

        const balance = await prisma.tradingBalance.findUnique({ where: { userId: user.id } });
        expect(balance!.available).toBe(1000n);
        expect(balance!.locked).toBe(0n);

        const order = await prisma.order.findUnique({ where: { id: "order-sell-1" } });
        expect(order!.lockedAmount).toBe(0n);
    });

    it("throws InsufficientBalanceError and rolls back if balance too low", async () => {
        const user = await createUserWithBalance("vaultly-user-3", 100n);

        await expect(
            lockBalanceForOrder({
                prisma,
                userId: user.id,
                orderId: "order-2",
                commandId: "cmd-2",
                market: "TATA-INR",
                side: "BUY",
                price: 100n,
                qty: 5n,
            })
        ).rejects.toThrow(InsufficientBalanceError);

        const balance = await prisma.tradingBalance.findUnique({ where: { userId: user.id } });
        expect(balance!.available).toBe(100n);

        const order = await prisma.order.findUnique({ where: { id: "order-2" } });
        expect(order).toBeNull();
    });
});

describe("consumeLockOnFill + creditFillProceeds — atomicity", () => {
    it("deducts BUY locked and credits SELL available in single transaction", async () => {
        const buyer = await createUserWithBalance("buyer-1", 500n);
        const seller = await createUserWithBalance("seller-1", 0n);

        await lockBalanceForOrder({
            prisma, userId: buyer.id, orderId: "buy-order-1",
            commandId: "cmd-buy-1", market: "TATA-INR",
            side: "BUY", price: 100n, qty: 5n,
        });
        await lockBalanceForOrder({
            prisma, userId: seller.id, orderId: "sell-order-1",
            commandId: "cmd-sell-1", market: "TATA-INR",
            side: "SELL", price: 100n, qty: 5n,
        });

        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            await consumeLockOnFill({ tx, orderId: "buy-order-1", filledQty: 5n, fillPrice: 100n });
            await creditFillProceeds({ tx, orderId: "sell-order-1", fillPrice: 100n, fillQty: 5n });
        });

        const buyerBalance = await prisma.tradingBalance.findUnique({ where: { userId: buyer.id } });
        const sellerBalance = await prisma.tradingBalance.findUnique({ where: { userId: seller.id } });

        expect(buyerBalance!.locked).toBe(0n);
        expect(sellerBalance!.available).toBe(500n);

        const buyOrder = await prisma.order.findUnique({ where: { id: "buy-order-1" } });
        expect(buyOrder!.status).toBe("FILLED");
        expect(buyOrder!.filledQty).toBe(5n);
    });

    it("rolls back both if creditFillProceeds fails — buyer locked not lost", async () => {
        const buyer = await createUserWithBalance("buyer-2", 500n);
        await lockBalanceForOrder({
            prisma, userId: buyer.id, orderId: "buy-order-2",
            commandId: "cmd-buy-2", market: "TATA-INR",
            side: "BUY", price: 100n, qty: 5n,
        });

        await expect(
            prisma.$transaction(async (tx: Prisma.TransactionClient) => {
                await consumeLockOnFill({ tx, orderId: "buy-order-2", filledQty: 5n, fillPrice: 100n });
                throw new Error("simulated DB failure");
            })
        ).rejects.toThrow("simulated DB failure");

        const balance = await prisma.tradingBalance.findUnique({ where: { userId: buyer.id } });
        expect(balance!.locked).toBe(500n);
        expect(balance!.available).toBe(0n);
    });
});

describe("releaseLockForOrder — idempotency", () => {
    it("releases remaining locked balance and marks order CANCELLED", async () => {
        const user = await createUserWithBalance("user-cancel-1", 500n);
        await lockBalanceForOrder({
            prisma, userId: user.id, orderId: "order-cancel-1",
            commandId: "cmd-cancel-1", market: "TATA-INR",
            side: "BUY", price: 100n, qty: 5n,
        });

        await releaseLockForOrder({ prisma, orderId: "order-cancel-1" });

        const balance = await prisma.tradingBalance.findUnique({ where: { userId: user.id } });
        expect(balance!.available).toBe(500n);
        expect(balance!.locked).toBe(0n);

        const order = await prisma.order.findUnique({ where: { id: "order-cancel-1" } });
        expect(order!.status).toBe("CANCELLED");
    });

    it("is idempotent — second call does not double-credit", async () => {
        const user = await createUserWithBalance("user-cancel-2", 500n);
        await lockBalanceForOrder({
            prisma, userId: user.id, orderId: "order-cancel-2",
            commandId: "cmd-cancel-2", market: "TATA-INR",
            side: "BUY", price: 100n, qty: 5n,
        });

        await releaseLockForOrder({ prisma, orderId: "order-cancel-2" });
        await releaseLockForOrder({ prisma, orderId: "order-cancel-2" });

        const balance = await prisma.tradingBalance.findUnique({ where: { userId: user.id } });
        expect(balance!.available).toBe(500n);
        expect(balance!.locked).toBe(0n);
    });
});
