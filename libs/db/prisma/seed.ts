import "dotenv/config";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

const MARKETS: [string, bigint][] = [
    ["NVDA-INR", 12500n],
    ["GOOGL-INR", 17500n],
    ["AAPL-INR", 22500n],
    ["MSFT-INR", 42000n],
    ["AMZN-INR", 18500n],
    ["TSM-INR", 16500n],
    ["AVGO-INR", 10500n],
    ["META-INR", 9500n],
    ["TSLA-INR", 11500n],
    ["005930.KS-INR", 5500n],
    ["000660.KS-INR", 8500n],
    ["TCEHY-INR", 4500n],
    ["ASML-INR", 9500n],
    ["MU-INR", 6500n],
    ["ORCL-INR", 14000n],
    ["AMD-INR", 8500n],
    ["NFLX-INR", 65000n],
    ["PLTR-INR", 7500n],
    ["CSCO-INR", 5500n],
    ["BABA-INR", 7500n],
    ["LRCX-INR", 6500n],
    ["INTC-INR", 2500n],
    ["AMAT-INR", 6500n],
    ["KLAC-INR", 9500n],
    ["IBM-INR", 11500n],
    ["ANET-INR", 16500n],
    ["TXN-INR", 18500n],
    ["ARM-INR", 12500n],
    ["SAP-INR", 22500n],
    ["ADI-INR", 22500n],
];

const QTY_PER_MARKET = 10n;
const BOT_TOTAL_BALANCE = 600_000n;

async function seedBotInventoryForMarket(
    botUserId: string,
    counterpartyUserId: string,
    market: string,
    price: bigint
): Promise<void> {
    const qty = QTY_PER_MARKET;
    const lockedAmount = price * qty;

    const counterpartySellOrder = await prisma.order.upsert({
        where: { commandId: `seed-counterparty-sell-${market}` },
        update: {},
        create: {
            id: `seed-counterparty-sell-${market}-order`,
            userId: counterpartyUserId,
            commandId: `seed-counterparty-sell-${market}`,
            market,
            side: "SELL", orderType: "LIMIT",
            price,
            qty, filledQty: qty,
            lockedAmount: 0n, consumedLocked: 0n,
            status: "FILLED",
        },
    });

    const botBuyOrder = await prisma.order.upsert({
        where: { commandId: `seed-bot-buy-${market}` },
        update: {},
        create: {
            id: `seed-bot-buy-${market}-order`,
            userId: botUserId,
            commandId: `seed-bot-buy-${market}`,
            market,
            side: "BUY", orderType: "LIMIT",
            price,
            qty, filledQty: qty,
            lockedAmount,
            consumedLocked: lockedAmount,
            status: "FILLED",
        },
    });

    await prisma.trade.upsert({
        where: {
            makerOrderId_takerOrderId: {
                makerOrderId: counterpartySellOrder.id,
                takerOrderId: botBuyOrder.id,
            },
        },
        update: {},
        create: {
            market,
            makerOrderId: counterpartySellOrder.id,
            takerOrderId: botBuyOrder.id,
            price,
            qty,
            takerSide: "BUY",
            executedAt: new Date(),
        },
    });

    console.log(`Bot inventory seeded: market=${market} price=${price} qty=${qty}`);
}

async function main(): Promise<void> {
    const botUser = await prisma.user.upsert({
        where: { vaultlyUserId: "mm-bot-1" },
        update: {},
        create: { vaultlyUserId: "mm-bot-1", email: "mm@arbitium.internal" },
    });
    console.log(`Bot user: ${botUser.id}`);

    const totalCost = MARKETS.reduce((sum, [, price]) => sum + price * QTY_PER_MARKET, 0n);
    const availableBalance = totalCost > BOT_TOTAL_BALANCE ? totalCost : BOT_TOTAL_BALANCE;

    await prisma.tradingBalance.upsert({
        where: { userId: botUser.id },
        update: { available: availableBalance },
        create: { userId: botUser.id, available: availableBalance, locked: 0n },
    });
    console.log(`Bot balance seeded: ${availableBalance} (total cost across all markets: ${totalCost})`);

    const counterparty = await prisma.user.upsert({
        where: { vaultlyUserId: "mm-seed-counterparty" },
        update: {},
        create: { vaultlyUserId: "mm-seed-counterparty" },
    });
    await prisma.tradingBalance.upsert({
        where: { userId: counterparty.id },
        update: {},
        create: { userId: counterparty.id, available: 0n, locked: 0n },
    });

    for (const [market, price] of MARKETS) {
        await seedBotInventoryForMarket(botUser.id, counterparty.id, market, price);
    }
}

main()
    .catch((err) => {
        console.error("Seed failed:", err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
