import "dotenv/config";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main(): Promise<void> {
    const botUser = await prisma.user.upsert({
        where: { vaultlyUserId: "mm-bot-1" },
        update: {},
        create: {
            vaultlyUserId: "mm-bot-1",
            email: "mm@arbitium.internal",
        },
    });

    console.log(`Bot user: ${botUser.id}`);

    const botBalance = await prisma.tradingBalance.upsert({
        where: { userId: botUser.id },
        update: { available: 999_999_999_999n },
        create: {
            userId: botUser.id,
            available: 999_999_999_999n,
            locked: 0n,
        },
    });

    console.log(`Bot balance seeded: available=${botBalance.available}`);
}

main()
    .catch((err) => {
        console.error("Seed failed:", err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
