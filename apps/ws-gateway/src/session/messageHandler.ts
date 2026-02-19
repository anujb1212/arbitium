import type { ClientSession } from "./ClientSession";
import type { MarketFeedManager } from "../feed/MarketFeedManager";
import { MAX_MARKET_ID_LENGTH } from "../config";

type IncomingMessage =
    | { type: "subscribe"; market: string }
    | { type: "unsubscribe"; market: string }

function parsedMessage(raw: string): IncomingMessage | null {
    let parsed: unknown
    try {
        parsed = JSON.parse(raw)
    } catch {
        return null
    }

    if (typeof parsed !== "object" || parsed === null) return null

    const msg = parsed as Record<string, unknown>
    const type = msg["type"]
    const market = msg["market"]

    if (type !== "subscribe" && type !== "unsubscribe") return null
    if (typeof market !== "string" || market.length === 0 || market.length > MAX_MARKET_ID_LENGTH) return null

    return { type, market }
}

export async function handleMessage(
    raw: string,
    session: ClientSession,
    feedManager: MarketFeedManager
): Promise<void> {
    const message = parsedMessage(raw)

    if (!message) {
        session.sendError("INVALID_MESSAGE")
        return
    }

    if (message.type === "subscribe") {
        if (session.isSubscribed(message.market)) return

        if (!session.canSubscribe()) {
            session.sendError("SUBSCRIPTION_LIMIT_REACHED")
            return
        }

        session.addSubscription(message.market)
        await feedManager.subscribeMarket(message.market, session.onEvent)
        return
    }

    //unsubscribe
    if (!session.isSubscribed(message.market)) return

    session.removeSubscription(message.market)
    await feedManager.unsubscribeMarket(message.market, session.onEvent)
}