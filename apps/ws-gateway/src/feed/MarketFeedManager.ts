import { MarketFeed, EventListener } from "./MarketFeed";
import type { RedisClient } from "@arbitium/ts-engine-client/redis/types";
import type { PubSubClient } from "../redis";

const MAX_REPLAY_LOOKBACK_MS = 5 * 60 * 1000

export class MarketFeedManager {
    private readonly feeds: Map<string, MarketFeed> = new Map()

    public constructor(
        private readonly commandClient: RedisClient,
        private readonly pubSubClient: PubSubClient
    ) { }

    public async subscribeMarket(market: string, listener: EventListener, fromEventId?: string): Promise<void> {
        let feed = this.feeds.get(market)

        if (!feed) {
            const nextFeed = new MarketFeed(market, this.commandClient)
            this.feeds.set(market, nextFeed)
            nextFeed.initializeCursorWithLookback(120000)
            nextFeed.startFallbackPoll()

            try {
                await this.pubSubClient.subscribe(`evtPing:${market}`, () => {
                    this.onPing(market)
                })
            } catch (error) {
                this.feeds.delete(market)
                nextFeed.stopFallbackPoll()
                throw error
            }

            feed = nextFeed
        }

        feed.addListener(listener)

        if (fromEventId) {
            const eventTimestampMs = parseInt(fromEventId.split("-")[0], 10)
            const isRecentEnough = !isNaN(eventTimestampMs) &&
                (Date.now() - eventTimestampMs) < MAX_REPLAY_LOOKBACK_MS
            if (isRecentEnough) {
                await feed.replayTo(listener, fromEventId)
            }
        }

        await feed.readAndFanOut()
    }

    public async unsubscribeMarket(market: string, listener: EventListener): Promise<void> {
        const feed = this.feeds.get(market)

        if (!feed) return

        feed.removeListener(listener)

        if (!feed.hasListeners()) {
            this.feeds.delete(market)
            feed.stopFallbackPoll()
            await this.pubSubClient.unsubscribe(`evtPing:${market}`)
        }
    }

    private onPing(market: string): void {
        const feed = this.feeds.get(market)
        if (!feed) return

        feed.readAndFanOut().catch((err) => {
            console.error(`MarketFeedManager: readAndFanOut failed for ${market}`, err)
        })
    }
}