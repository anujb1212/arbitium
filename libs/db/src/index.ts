import { PrismaClient } from "../generated/prisma";


const prismaClientSingleton = () => {
    const url = process.env.DATABASE_URL;

    if (!url) {
        return new Proxy(
            {},
            {
                get() {
                    throw new Error(
                        "Missing DATABASE_URL — set it in your .env"
                    );
                },
            }
        ) as unknown as PrismaClient;
    }

    return new PrismaClient({
        datasources: { db: { url } },
        log: [
            { emit: "stdout", level: "error" },
            { emit: "stdout", level: "warn" },
        ],
    });
};

declare global {
    var arbitiumPrismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

function getPrisma() {
    const client =
        globalThis.arbitiumPrismaGlobal ?? prismaClientSingleton();
    if (process.env.NODE_ENV !== "production") {
        globalThis.arbitiumPrismaGlobal = client;
    }
    return client;
}

const db = new Proxy(
    {},
    {
        get(_target, prop) {
            const client = getPrisma();
            return (client as any)[prop];
        },
    }
) as unknown as PrismaClient;

export default db;
export { db as prisma };

export * from "./balanceService";
