import { MarketFeed, EventListener } from "./MarketFeed";
import type { RedisClient } from "@arbitium/ts-engine-client/redis/types";
import type { PubSubClient } from "../redis";

export class MarketFeedManager {
    private readonly feeds: Map<string, MarketFeed> = new Map()

    public constructor(
        private readonly commandClient: RedisClient,
        private readonly pubSubClient: PubSubClient
    ) { }

    public async subscribeMarket(market: string, listener: EventListener): Promise<void> {
        let feed = this.feeds.get(market)

        if (!feed) {
            feed = new MarketFeed(market, this.commandClient)
            this.feeds.set(market, feed)
            await this.pubSubClient.subscribe(
                `evtPing:${market}`, () => { this.onPing(market) }
            )
        }

        feed.addListener(listener)
        await feed.readAndFanOut()
    }

    public async unsubscribeMarket(market: string, listener: EventListener): Promise<void> {
        const feed = this.feeds.get(market)

        if (!feed) return

        feed.removeListener(listener)

        if (!feed.hasListeners()) {
            this.feeds.delete(market)
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