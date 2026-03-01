import { WebSocketServer, WebSocket } from "ws";
import { REDIS_URL, WS_PORT } from "./config";
import { connectRedis, disconnectRedis, getCommandClient, getPubSubClient } from "./redis";
import { MarketFeedManager } from "./feed/MarketFeedManager";
import { ClientSession } from "./session/ClientSession";
import { handleMessage } from "./session/messageHandler";

async function main(): Promise<void> {
    await connectRedis(REDIS_URL)

    const feedManager = new MarketFeedManager(getCommandClient(), getPubSubClient())
    const wss = new WebSocketServer({ port: WS_PORT })

    wss.on("listening", () => {
        console.log(`[ws-gateway] Listening on port ${WS_PORT}`)
    })

    wss.on("error", (err) => {
        console.error("[ws-gateway] Server error:", err)
    })

    wss.on("connection", (socket: WebSocket) => {
        const session = new ClientSession(socket)

        socket.on("message", (data) => {
            handleMessage(data.toString(), session, feedManager).catch((err) => {
                console.error("[WS] handleMessage error:", err)
            })
        })

        Promise.all(
            Array.from(session.getSubscriptions()).map((market) =>
                feedManager.unsubscribeMarket(market, session.onEvent).catch((err) => {
                    console.error(`[WS] unsubscribe cleanup error for ${market}:`, err)
                })
            )
        ).catch(() => { })
    })

    const shutdown = async (): Promise<void> => {
        console.log("[ws-gateway] Shutting down...")

        wss.close()

        for (const socket of wss.clients) {
            socket.terminate()
        }

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
