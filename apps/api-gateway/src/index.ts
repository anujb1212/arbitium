import "dotenv/config"
import express from "express";
import { ordersRouter } from "./routes/orders";
import { connectRedis, disconnectRedis, getRedisClient } from "./redis";
import cors from "cors"
import { recoverRollbackPendingWithdrawals, transfersRouter } from "./routes/transfers";
import { marketRouter } from "./routes/market";
import { prisma } from "@arbitium/db";

const PORT = Number(process.env.PORT ?? 3002);

const app = express();
app.use(express.json());
app.use(cors())

app.get("/healthz", async (_req, res) => {
    try {
        await getRedisClient().sendCommand(["PING"]);
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: "ok" });
    } catch (error) {
        console.error("[healthz] check failed:", error);
        res.status(503).json({ status: "degraded" });
    }
});

app.use("/orders", ordersRouter);
app.use("/transfers", transfersRouter);
app.use("/market", marketRouter);
async function shutdown(server: ReturnType<typeof app.listen>): Promise<void> {
    await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
    });
    await disconnectRedis();
    process.exit(0);
}

async function main(): Promise<void> {
    await connectRedis();
    await recoverRollbackPendingWithdrawals();
    const server = app.listen(PORT, () => {
        console.log(`api-gateway listening on :${PORT}`);
    });

    process.on("SIGINT", () => shutdown(server));
    process.on("SIGTERM", () => shutdown(server));
}

main().catch((error: unknown) => {
    console.error("api-gateway failed to start:", error);
    process.exit(1);
});
