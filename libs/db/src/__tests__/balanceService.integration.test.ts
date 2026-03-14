import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "../index";
import {
    lockBalanceForOrder,
    consumeLockOnFill,
    creditFillProceeds,
    releaseLockForOrder,
    InsufficientBalanceError,
    settleMarketOrder,
    lockBalanceForMarketOrder,
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
        expect(order!.status).toBe("PENDING");
        expect(order!.lockedAmount).toBe(500n);
    });

    it("locks 0n for SELL side — no INR deducted", async () => {
        const user = await createUserWithBalance("vaultly-user-2", 1000n);
        const counterparty = await createUserWithBalance("vaultly-counterparty-2", 0n);

        const counterpartySellOrder = await prisma.order.create({
            data: {
                id: "cp-sell-for-sell-side-test", userId: counterparty.id,
                commandId: "cmd-cp-sell-for-sell-side-test", market: "TATA-INR",
                side: "SELL", orderType: "LIMIT",
                price: 100n, qty: 5n, filledQty: 5n,
                lockedAmount: 0n, consumedLocked: 0n, status: "FILLED",
            },
        });
        const userBuyOrder = await prisma.order.create({
            data: {
                id: "user-buy-for-sell-side-test", userId: user.id,
                commandId: "cmd-user-buy-for-sell-side-test", market: "TATA-INR",
                side: "BUY", orderType: "LIMIT",
                price: 100n, qty: 5n, filledQty: 5n,
                lockedAmount: 500n, consumedLocked: 500n, status: "FILLED",
            },
        });
        await prisma.trade.create({
            data: {
                market: "TATA-INR",
                makerOrderId: counterpartySellOrder.id,
                takerOrderId: userBuyOrder.id,
                price: 100n, qty: 5n,
                takerSide: "BUY", executedAt: new Date(),
            },
        });

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

        const originalSellerCounterparty = await createUserWithBalance("original-seller-atomicity", 0n);
        const counterpartySellerOrder = await prisma.order.create({
            data: {
                id: "counterparty-sell-for-seller-holdings", userId: originalSellerCounterparty.id,
                commandId: "cmd-counterparty-sell-for-seller-holdings", market: "TATA-INR",
                side: "SELL", orderType: "LIMIT",
                price: 100n, qty: 5n, filledQty: 5n,
                lockedAmount: 0n, consumedLocked: 0n, status: "FILLED",
            },
        });
        const sellerPriorBuyOrder = await prisma.order.create({
            data: {
                id: "seller-prior-buy-for-holdings", userId: seller.id,
                commandId: "cmd-seller-prior-buy-for-holdings", market: "TATA-INR",
                side: "BUY", orderType: "LIMIT",
                price: 100n, qty: 5n, filledQty: 5n,
                lockedAmount: 500n, consumedLocked: 500n, status: "FILLED",
            },
        });
        await prisma.trade.create({
            data: {
                market: "TATA-INR",
                makerOrderId: counterpartySellerOrder.id,  // maker SOLD
                takerOrderId: sellerPriorBuyOrder.id,      // taker (seller) BOUGHT
                price: 100n, qty: 5n,
                takerSide: "BUY", executedAt: new Date(),
            },
        });

        await prisma.order.create({
            data: {
                id: "holdings-seller-atomicity-test",
                userId: seller.id,
                commandId: "cmd-holdings-seller-atomicity-test",
                market: "TATA-INR",
                side: "BUY",
                orderType: "LIMIT",
                price: 100n, qty: 5n, filledQty: 5n,
                lockedAmount: 500n, consumedLocked: 500n,
                status: "FILLED",
            },
        });

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

describe("consumeLockOnFill — consumedLocked tracking", () => {
    it("LIMIT BUY partial fill: consumedLocked increments so cancel releases correct remainder", async () => {
        const user = await createUserWithBalance("user-partial-1", 1000n);
        await lockBalanceForOrder({
            prisma,
            userId: user.id,
            orderId: "order-partial-1",
            commandId: "cmd-partial-1",
            market: "TATA-INR",
            side: "BUY",
            price: 10n,
            qty: 100n,
        });

        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            await consumeLockOnFill({ tx, orderId: "order-partial-1", filledQty: 30n, fillPrice: 9n });
        });

        const orderAfterFill = await prisma.order.findUnique({ where: { id: "order-partial-1" } });
        expect(orderAfterFill!.consumedLocked).toBe(300n); // limitPrice(10) * filledQty(30)

        await releaseLockForOrder({ prisma, orderId: "order-partial-1" });

        const balance = await prisma.tradingBalance.findUnique({ where: { userId: user.id } });
        expect(balance!.available).toBe(730n); // 1000 locked - 300 consumed = 700 released
        expect(balance!.locked).toBe(0n);
    });

    it("MARKET BUY: settleMarketOrder releases only unfilled locked portion", async () => {
        const user = await createUserWithBalance("user-market-settle-1", 100n);
        await lockBalanceForMarketOrder({
            prisma,
            userId: user.id,
            orderId: "order-market-settle-1",
            commandId: "cmd-market-settle-1",
            market: "TATA-INR",
            side: "BUY",
            qty: 10n,
        });

        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            await consumeLockOnFill({ tx, orderId: "order-market-settle-1", filledQty: 10n, fillPrice: 3n });
        });

        await settleMarketOrder({ prisma, orderId: "order-market-settle-1" });

        const balance = await prisma.tradingBalance.findUnique({ where: { userId: user.id } });
        expect(balance!.available).toBe(70n); // 100 locked - 30 consumed = 70 released
        expect(balance!.locked).toBe(0n);
    });
});

describe("lockBalanceForMarketOrder — SELL TOCTOU", () => {
    it("rejects MARKET SELL when user has zero holdings", async () => {
        const user = await createUserWithBalance("user-market-sell-toctou-1", 1000n);

        await expect(
            lockBalanceForMarketOrder({
                prisma,
                userId: user.id,
                orderId: "order-market-sell-toctou-1",
                commandId: "cmd-market-sell-toctou-1",
                market: "TATA-INR",
                side: "SELL",
                qty: 5n,
            })
        ).rejects.toThrow(InsufficientBalanceError);

        // Balance must be untouched — no order created
        const balance = await prisma.tradingBalance.findUnique({ where: { userId: user.id } });
        expect(balance!.available).toBe(1000n);
        expect(balance!.locked).toBe(0n);

        const order = await prisma.order.findUnique({ where: { id: "order-market-sell-toctou-1" } });
        expect(order).toBeNull();
    });

    it("rejects second MARKET SELL that would oversell beyond available holdings", async () => {
        const user = await createUserWithBalance("user-market-sell-toctou-2", 0n);

        const counterpartyUser = await createUserWithBalance("user-market-sell-counterparty", 500n);

        const counterpartySellOrder = await prisma.order.create({
            data: {
                id: "counterparty-sell-order-1",
                userId: counterpartyUser.id,
                commandId: "cmd-counterparty-sell-1",
                market: "TATA-INR",
                side: "SELL", orderType: "LIMIT",
                price: 100n, qty: 5n, filledQty: 5n,
                lockedAmount: 0n, consumedLocked: 0n,
                status: "FILLED",
            },
        });

        const userBuyOrder = await prisma.order.create({
            data: {
                id: "user-buy-order-for-holdings-1",
                userId: user.id,
                commandId: "cmd-user-buy-holdings-1",
                market: "TATA-INR",
                side: "BUY", orderType: "LIMIT",
                price: 100n, qty: 5n, filledQty: 5n,
                lockedAmount: 500n, consumedLocked: 500n,
                status: "FILLED",
            },
        });

        await prisma.trade.create({
            data: {
                market: "TATA-INR",
                makerOrderId: counterpartySellOrder.id,
                takerOrderId: userBuyOrder.id,
                price: 100n, qty: 5n,
                takerSide: "BUY",
                executedAt: new Date(),
            },
        });

        // First MARKET SELL 5 — consumes all holdings, must pass
        await lockBalanceForMarketOrder({
            prisma,
            userId: user.id,
            orderId: "order-market-sell-toctou-2a",
            commandId: "cmd-market-sell-toctou-2a",
            market: "TATA-INR",
            side: "SELL",
            qty: 5n,
        });

        const orderAfterFirst = await prisma.order.findUnique({
            where: { id: "order-market-sell-toctou-2a" },
        });
        expect(orderAfterFirst).not.toBeNull();

        // Second MARKET SELL 1 — 0 shares left, must be rejected
        await expect(
            lockBalanceForMarketOrder({
                prisma,
                userId: user.id,
                orderId: "order-market-sell-toctou-2b",
                commandId: "cmd-market-sell-toctou-2b",
                market: "TATA-INR",
                side: "SELL",
                qty: 1n,
            })
        ).rejects.toThrow(InsufficientBalanceError);

        // Second order must not exist — transaction rolled back
        const orderAfterSecond = await prisma.order.findUnique({
            where: { id: "order-market-sell-toctou-2b" },
        });
        expect(orderAfterSecond).toBeNull();
    });
});
