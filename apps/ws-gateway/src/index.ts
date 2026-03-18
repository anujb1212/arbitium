import "dotenv/config"
import { WebSocketServer, WebSocket } from "ws";
import { REDIS_URL, WS_PORT } from "./config";
import { connectRedis, disconnectRedis, getCommandClient, getPubSubClient } from "./redis";
import { MarketFeedManager } from "./feed/MarketFeedManager";
import { ClientSession } from "./session/ClientSession";
import { handleMessage } from "./session/messageHandler";
import { createServer, IncomingMessage } from "http";
import { verifyConnectionToken } from "./auth/verifyToken";

const HEALTH_PORT = Number(process.env.HEALTH_PORT ?? "8081");

async function main(): Promise<void> {
    await connectRedis(REDIS_URL)

    const healthServer = createServer(async (req, res) => {
        if (req.url !== "/healthz") {
            res.writeHead(404).end();
            return;
        }
        try {
            await getCommandClient().sendCommand(["PING"]);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ status: "ok" }));
        } catch (error) {
            console.error("[healthz] check failed:", error);
            res.writeHead(503, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ status: "degraded" }));
        }
    })

    healthServer.listen(HEALTH_PORT, () => {
        console.log(`[ws-gateway] Health check on :${HEALTH_PORT}`);
    });

    const feedManager = new MarketFeedManager(getCommandClient(), getPubSubClient())
    const wss = new WebSocketServer({ port: WS_PORT })

    wss.on("listening", () => {
        console.log(`[ws-gateway] Listening on port ${WS_PORT}`)
    })

    wss.on("error", (err) => {
        console.error("[ws-gateway] Server error:", err)
    })

    wss.on("connection", (socket: WebSocket, request: IncomingMessage) => {
        const requestUrl = new URL(request.url ?? "", `http://localhost`);
        const token = requestUrl.searchParams.get("token");

        if (!token) {
            socket.close(4001, "Unauthorized");
            return;
        }

        const verified = verifyConnectionToken(token);
        if (!verified) {
            socket.close(4001, "Unauthorized");
            return;
        }

        const session = new ClientSession(socket, verified.userId);
        socket.on("message", (data) => {
            handleMessage(data.toString(), session, feedManager).catch((err) => {
                console.error("[WS] handleMessage error:", err)
            })
        })

        socket.on("close", () => {
            Promise.all(
                Array.from(session.getSubscriptions()).map((market) =>
                    feedManager.unsubscribeMarket(market, session.onEvent).catch((err) => {
                        console.error(`[WS] unsubscribe cleanup error for ${market}:`, err)
                    })
                )
            ).catch(() => { })
        })
    })

    const shutdown = async (): Promise<void> => {
        console.log("[ws-gateway] Shutting down...")
        healthServer.close();

        for (const socket of wss.clients) {
            socket.close(1001, "Server shutting down");
        }

        wss.close()

        await new Promise<void>((resolve) => wss.once("close", resolve));

        await disconnectRedis()
        process.exit(0)
    }

    process.once("SIGINT", () => { shutdown().catch(console.error) })
    process.once("SIGTERM", () => { shutdown().catch(console.error) })
}

main().catch((err) => {
    console.error("[ws-gateway] Fatal:", err);
    process.exit(1);
})
