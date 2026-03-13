import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "../index";
import {
    queryFillsByUserAndMarket,
    queryOrderHistoryByUserAndMarket,
} from "../orderQueryService";

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

async function createUser(vaultlyUserId: string) {
    return prisma.user.create({ data: { vaultlyUserId } });
}

async function createOrder(
    userId: string,
    overrides: {
        id: string;
        commandId: string;
        market?: string;
        side?: "BUY" | "SELL";
        price?: bigint;
        qty?: bigint;
        status?: "OPEN" | "FILLED" | "CANCELLED" | "PARTIALLY_FILLED" | "PENDING" | "REJECTED";
    }
) {
    return prisma.order.create({
        data: {
            id: overrides.id,
            commandId: overrides.commandId,
            userId,
            market: overrides.market ?? "TATA-INR",
            side: overrides.side ?? "BUY",
            price: overrides.price ?? 100n,
            qty: overrides.qty ?? 5n,
            filledQty: 0n,
            lockedAmount: 0n,
            status: overrides.status ?? "OPEN",
        },
    });
}

async function createTrade({
    market,
    makerOrderId,
    takerOrderId,
    takerSide,
    price = 100n,
    qty = 5n,
}: {
    market: string;
    makerOrderId: string;
    takerOrderId: string;
    takerSide: "BUY" | "SELL";
    price?: bigint;
    qty?: bigint;
}) {
    return prisma.trade.create({
        data: { market, makerOrderId, takerOrderId, takerSide, price, qty },
    });
}

describe("queryFillsByUserAndMarket", () => {
    it("assigns MAKER role and correct side when userId owns the maker order", async () => {
        const maker = await createUser("vaultly-maker-1");
        const taker = await createUser("vaultly-taker-1");

        await createOrder(maker.id, { id: "order-maker-1", commandId: "cmd-1", side: "SELL" });
        await createOrder(taker.id, { id: "order-taker-1", commandId: "cmd-2", side: "BUY" });
        await createTrade({
            market: "TATA-INR",
            makerOrderId: "order-maker-1",
            takerOrderId: "order-taker-1",
            takerSide: "BUY",
        });

        const fills = await queryFillsByUserAndMarket({
            prisma,
            userId: maker.id,
            market: "TATA-INR",
        });

        expect(fills).toHaveLength(1);
        expect(fills[0].role).toBe("MAKER");
        expect(fills[0].side).toBe("SELL");
        expect(fills[0].price).toBe("100");
        expect(fills[0].qty).toBe("5");
        expect(typeof fills[0].executedAtMs).toBe("number");
    });

    it("assigns TAKER role and correct side when userId owns the taker order", async () => {
        const maker = await createUser("vaultly-maker-2");
        const taker = await createUser("vaultly-taker-2");

        await createOrder(maker.id, { id: "order-maker-2", commandId: "cmd-3", side: "SELL" });
        await createOrder(taker.id, { id: "order-taker-2", commandId: "cmd-4", side: "BUY" });
        await createTrade({
            market: "TATA-INR",
            makerOrderId: "order-maker-2",
            takerOrderId: "order-taker-2",
            takerSide: "BUY",
        });

        const fills = await queryFillsByUserAndMarket({
            prisma,
            userId: taker.id,
            market: "TATA-INR",
        });

        expect(fills).toHaveLength(1);
        expect(fills[0].role).toBe("TAKER");
        expect(fills[0].side).toBe("BUY");
    });

    it("does not return trades from a different market", async () => {
        const maker = await createUser("vaultly-maker-3");
        const taker = await createUser("vaultly-taker-3");

        await createOrder(maker.id, { id: "order-maker-3", commandId: "cmd-5", market: "INFY-INR", side: "SELL" });
        await createOrder(taker.id, { id: "order-taker-3", commandId: "cmd-6", market: "INFY-INR", side: "BUY" });
        await createTrade({
            market: "INFY-INR",
            makerOrderId: "order-maker-3",
            takerOrderId: "order-taker-3",
            takerSide: "BUY",
        });

        const fills = await queryFillsByUserAndMarket({
            prisma,
            userId: maker.id,
            market: "TATA-INR",
        });

        expect(fills).toHaveLength(0);
    });

    it("returns fills ordered by executedAt descending", async () => {
        const maker = await createUser("vaultly-maker-4");
        const taker = await createUser("vaultly-taker-4");

        await createOrder(maker.id, { id: "order-maker-4a", commandId: "cmd-7", side: "SELL", qty: 2n });
        await createOrder(maker.id, { id: "order-maker-4b", commandId: "cmd-8", side: "SELL", qty: 3n });
        await createOrder(taker.id, { id: "order-taker-4a", commandId: "cmd-9", side: "BUY", qty: 2n });
        await createOrder(taker.id, { id: "order-taker-4b", commandId: "cmd-10", side: "BUY", qty: 3n });

        const tradeA = await createTrade({
            market: "TATA-INR",
            makerOrderId: "order-maker-4a",
            takerOrderId: "order-taker-4a",
            takerSide: "BUY",
            qty: 2n,
        });
        const tradeB = await createTrade({
            market: "TATA-INR",
            makerOrderId: "order-maker-4b",
            takerOrderId: "order-taker-4b",
            takerSide: "BUY",
            qty: 3n,
        });

        const fills = await queryFillsByUserAndMarket({
            prisma,
            userId: maker.id,
            market: "TATA-INR",
        });

        expect(fills).toHaveLength(2);
        expect(fills[0].executedAtMs).toBeGreaterThanOrEqual(fills[1].executedAtMs);
    });
});

describe("queryOrderHistoryByUserAndMarket", () => {
    it("returns OPEN, FILLED, and CANCELLED orders for the user in same market", async () => {
        const user = await createUser("vaultly-history-1");

        await createOrder(user.id, { id: "ord-open-1", commandId: "cmd-h1", status: "OPEN" });
        await createOrder(user.id, { id: "ord-filled-1", commandId: "cmd-h2", status: "FILLED" });
        await createOrder(user.id, { id: "ord-cancelled-1", commandId: "cmd-h3", status: "CANCELLED" });

        const history = await queryOrderHistoryByUserAndMarket({
            prisma,
            userId: user.id,
            market: "TATA-INR",
        });

        expect(history).toHaveLength(3);
        const statuses = history.map((o) => o.status);
        expect(statuses).toContain("OPEN");
        expect(statuses).toContain("FILLED");
        expect(statuses).toContain("CANCELLED");
    });

    it("does not return orders belonging to a different user in the same market", async () => {
        const user = await createUser("vaultly-history-2");
        const other = await createUser("vaultly-other-1");

        await createOrder(user.id, { id: "ord-user-1", commandId: "cmd-h4" });
        await createOrder(other.id, { id: "ord-other-1", commandId: "cmd-h5" });

        const history = await queryOrderHistoryByUserAndMarket({
            prisma,
            userId: user.id,
            market: "TATA-INR",
        });

        expect(history).toHaveLength(1);
        expect(history[0].orderId).toBe("ord-user-1");
    });

    it("does not return orders from a different market for the same user", async () => {
        const user = await createUser("vaultly-history-3");

        await createOrder(user.id, { id: "ord-tata-1", commandId: "cmd-h6", market: "TATA-INR" });
        await createOrder(user.id, { id: "ord-infy-1", commandId: "cmd-h7", market: "INFY-INR" });

        const history = await queryOrderHistoryByUserAndMarket({
            prisma,
            userId: user.id,
            market: "TATA-INR",
        });

        expect(history).toHaveLength(1);
        expect(history[0].orderId).toBe("ord-tata-1");
    });

    it("serialises price, qty, filledQty as strings (not bigint)", async () => {
        const user = await createUser("vaultly-history-4");

        await createOrder(user.id, {
            id: "ord-serial-1",
            commandId: "cmd-h8",
            price: 99500n,
            qty: 10n,
        });

        const history = await queryOrderHistoryByUserAndMarket({
            prisma,
            userId: user.id,
            market: "TATA-INR",
        });

        expect(history[0].price).toBe("99500");
        expect(history[0].qty).toBe("10");
        expect(history[0].filledQty).toBe("0");
        expect(typeof history[0].createdAtMs).toBe("number");
    });
});
