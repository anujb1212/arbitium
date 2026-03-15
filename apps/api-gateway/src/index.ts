import "dotenv/config"
import express from "express";
import { ordersRouter } from "./routes/orders";
import { connectRedis, disconnectRedis } from "./redis";
import cors from "cors"
import { recoverRollbackPendingWithdrawals, transfersRouter } from "./routes/transfers";
import { marketRouter } from "./routes/market";

const PORT = Number(process.env.PORT ?? 3002);

const app = express();
app.use(express.json());
app.use(cors())

app.use("/orders", ordersRouter);
app.use("/transfers", transfersRouter);
app.use("/market", marketRouter);
async function shutdown(server: ReturnType<typeof app.listen>): Promise<void> {
    server.close();
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
