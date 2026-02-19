import WebSocket from "ws";
import type { EventEnvelope } from "@arbitium/ts-shared/engine/types";
import type { EventListener } from "../feed/MarketFeed";
import { MAX_SUBSCRIPTIONS_PER_CLIENT } from "../config";

type WireMessage =
    | { type: "event"; data: EventEnvelope }
    | { type: "error"; message: string }

function bigintReplacer(_key: string, value: unknown): unknown {
    return typeof value === "bigint" ? value.toString(10) : value
}

export class ClientSession {
    private readonly subscriptions: Set<string> = new Set()

    public readonly onEvent: EventListener = (envelope: EventEnvelope): void => {
        this.send({
            type: "event",
            data: envelope
        })
    }

    public constructor(private readonly socket: WebSocket) { }


    public canSubscribe(): boolean {
        return this.subscriptions.size < MAX_SUBSCRIPTIONS_PER_CLIENT
    }

    public getSubscriptions(): ReadonlySet<string> {
        return this.subscriptions
    }

    public isSubscribed(market: string): boolean {
        return this.subscriptions.has(market)
    }

    public addSubscription(market: string): void {
        this.subscriptions.add(market)
    }

    public removeSubscription(market: string): void {
        this.subscriptions.delete(market)
    }

    public sendError(message: string): void {
        this.send({
            type: "error",
            message
        })
    }

    public close(): void {
        this.socket.close()
    }

    private send(payload: WireMessage): void {
        if (this.socket.readyState !== WebSocket.OPEN) return;
        this.socket.send(JSON.stringify(payload, bigintReplacer));
    }
}