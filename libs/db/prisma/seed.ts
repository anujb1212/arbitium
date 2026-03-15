import "dotenv/config";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

const MARKETS = ["TATA-INR", "RELIANCE-INR", "INFY-INR"];
const BOT_INVENTORY_QTY = 100_000n;
const BOT_INVENTORY_PRICE = 100n;

async function seedBotInventoryForMarket(
    botUserId: string,
    counterpartyUserId: string,
    market: string
): Promise<void> {
    const counterpartySellOrder = await prisma.order.upsert({
        where: { commandId: `seed-counterparty-sell-${market}` },
        update: {},
        create: {
            id: `seed-counterparty-sell-${market}-order`,
            userId: counterpartyUserId,
            commandId: `seed-counterparty-sell-${market}`,
            market,
            side: "SELL", orderType: "LIMIT",
            price: BOT_INVENTORY_PRICE,
            qty: BOT_INVENTORY_QTY, filledQty: BOT_INVENTORY_QTY,
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
            price: BOT_INVENTORY_PRICE,
            qty: BOT_INVENTORY_QTY, filledQty: BOT_INVENTORY_QTY,
            lockedAmount: BOT_INVENTORY_PRICE * BOT_INVENTORY_QTY,
            consumedLocked: BOT_INVENTORY_PRICE * BOT_INVENTORY_QTY,
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
            price: BOT_INVENTORY_PRICE,
            qty: BOT_INVENTORY_QTY,
            takerSide: "BUY",
            executedAt: new Date(),
        },
    });

    console.log(`Bot inventory seeded: market=${market} qty=${BOT_INVENTORY_QTY}`);
}

async function main(): Promise<void> {
    const botUser = await prisma.user.upsert({
        where: { vaultlyUserId: "mm-bot-1" },
        update: {},
        create: { vaultlyUserId: "mm-bot-1", email: "mm@arbitium.internal" },
    });
    console.log(`Bot user: ${botUser.id}`);

    await prisma.tradingBalance.upsert({
        where: { userId: botUser.id },
        update: { available: 999_999_999_999n },
        create: { userId: botUser.id, available: 999_999_999_999n, locked: 0n },
    });
    console.log(`Bot balance seeded`);

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

    for (const market of MARKETS) {
        await seedBotInventoryForMarket(botUser.id, counterparty.id, market);
    }
}

main()
    .catch((err) => {
        console.error("Seed failed:", err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
