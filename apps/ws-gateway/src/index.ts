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

    wss.on("connection", (socket: WebSocket) => {
        const session = new ClientSession(socket)

        socket.on("message", (data) => {
            handleMessage(data.toString(), session, feedManager).catch((err) => {
                console.error("[WS] handleMessage error:", err)
            })
        })

        socket.on("close", () => {
            for (const market of Array.from(session.getSubscriptions())) {
                feedManager.unsubscribeMarket(market, session.onEvent).catch((err) => {
                    console.error(`[WS] unsubscribe cleanup error for ${market} :`, err)
                })
            }
        })

        socket.on("error", (err) => {
            console.error("[ws] socket error: ", err)
        })

        const shutdown = async (): Promise<void> => {
            wss.close()
            await disconnectRedis()
            process.exit(0)
        }

        process.on("SIGINT", shutdown)
        process.on("SIGTERM", shutdown)

        console.log(`[ws-gateway] Listening on port ${WS_PORT}`)
    })
}

main().catch((err) => {
    console.error("[ws-gateway] Fatal:", err);
    process.exit(1);
})
