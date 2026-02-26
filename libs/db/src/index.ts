import { PrismaClient } from "../generated/prisma";

const globalForPrisma = globalThis as unknown as {
    arbitiumPrisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.arbitiumPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.arbitiumPrisma = prisma;
}

export default prisma;
