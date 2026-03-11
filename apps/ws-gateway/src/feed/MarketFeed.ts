import { readStreamSince } from "@arbitium/ts-engine-client/streams/readStreamSince";
import { decodeEventFromStreamFields } from "@arbitium/ts-shared/engine/wireCodec";
import type { RedisClient } from "@arbitium/ts-engine-client/redis/types";
import type { EventEnvelope } from "@arbitium/ts-shared/engine/types";
import { STREAM_READ_COUNT, STREAM_READ_BLOCK_MS } from "../config";

export type EventListener = (envelope: EventEnvelope) => void

export class MarketFeed {
    private lastSeenEventId: string
    private readonly listeners: Set<EventListener> = new Set()
    private readonly streamKey: string
    private isReading: boolean = false
    private readPending: boolean = false

    public constructor(
        private readonly market: string,
        private readonly client: RedisClient
    ) {
        this.streamKey = `arbitium:evt:${market}`
        this.lastSeenEventId = "0-0"
    }

    public initializeCursorWithLookback(lookbackMs: number): void {
        const fromTimestamp = Date.now() - lookbackMs;
        this.lastSeenEventId = `${fromTimestamp}-0`;
    }

    public addListener(listener: EventListener): void {
        this.listeners.add(listener)
    }

    public removeListener(listener: EventListener): void {
        this.listeners.delete(listener)
    }

    public hasListeners(): boolean {
        return this.listeners.size > 0
    }

    public async readAndFanOut(): Promise<void> {
        if (this.isReading) {
            this.readPending = true
            return
        }

        this.isReading = true
        try {
            do {
                this.readPending = false
                await this.doRead()
            } while (this.readPending)
        } finally {
            this.isReading = false
        }
    }
    private async doRead(): Promise<void> {
        const messages = await readStreamSince({
            client: this.client,
            streamKey: this.streamKey,
            fromId: this.lastSeenEventId,
            count: STREAM_READ_COUNT,
            blockMs: STREAM_READ_BLOCK_MS
        })

        if (messages.length === STREAM_READ_COUNT) {
            this.readPending = true
        }

        for (const message of messages) {
            this.lastSeenEventId = message.id

            const result = decodeEventFromStreamFields({
                ...message.fields,
                eventId: message.id
            })

            if (!result.accepted) {
                console.warn(`MarketFeed:${this.market} decode skip: ${result.rejectReason}`)
                continue
            }

            for (const listener of this.listeners) listener(result.value)
        }
    }
}
