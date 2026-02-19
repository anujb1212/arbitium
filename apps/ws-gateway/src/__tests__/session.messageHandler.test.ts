import { describe, it, expect, vi, beforeEach } from "vitest";
import WebSocket from "ws";
import { ClientSession } from "../session/ClientSession";
import { handleMessage } from "../session/messageHandler";

function makeMockSocket(): WebSocket {
    return {
        readyState: WebSocket.OPEN,
        send: vi.fn(),
        close: vi.fn(),
        on: vi.fn()
    } as unknown as WebSocket;
}

function makeMockFeedManager() {
    return {
        subscribeMarket: vi.fn().mockResolvedValue(undefined),
        unsubscribeMarket: vi.fn().mockResolvedValue(undefined),
    }
}

describe("handleMessage", () => {
    let socket: WebSocket;
    let session: ClientSession;
    let feedManager: ReturnType<typeof makeMockFeedManager>;

    beforeEach(() => {
        socket = makeMockSocket();
        session = new ClientSession(socket);
        feedManager = makeMockFeedManager();
    });

    it("sends INVALID_MESSAGE for non-JSON input", async () => {
        await handleMessage("not-json", session, feedManager as any);

        expect(socket.send).toHaveBeenCalledWith(
            JSON.stringify({
                type: "error",
                message: "INVALID_MESSAGE"
            })
        )
    });

    it("sends INVALID_MESSAGE when market field is missing", async () => {
        await handleMessage(JSON.stringify({ type: "subscribe" }), session, feedManager as any);
        expect(socket.send).toHaveBeenCalledWith(
            JSON.stringify({
                type: "error",
                message: "INVALID_MESSAGE"
            })
        )
    });

    it("sends INVALID_MESSAGE when market exceeds 64 chars", async () => {
        const market = "a".repeat(65);
        await handleMessage(JSON.stringify({
            type: "subscribe",
            market
        }),
            session,
            feedManager as any);
        expect(socket.send).toHaveBeenCalledWith(
            JSON.stringify({
                type: "error",
                message: "INVALID_MESSAGE"
            })
        )
    });

    it("calls subscribeMarket with stable onEvent reference", async () => {
        await handleMessage(JSON.stringify({
            type: "subscribe",
            market: "TATA-INR"
        }),
            session,
            feedManager as any);

        expect(feedManager.subscribeMarket).toHaveBeenCalledWith("TATA-INR", session.onEvent);
    });

    it("sends SUBSCRIPTION_LIMIT_REACHED when at cap", async () => {
        for (let i = 0; i < 10; i++) session.addSubscription(`mkt-${i}`);

        await handleMessage(JSON.stringify({ type: "subscribe", market: "TATA-INR" }), session, feedManager as any);

        expect(socket.send).toHaveBeenCalledWith(
            JSON.stringify({ type: "error", message: "SUBSCRIPTION_LIMIT_REACHED" })
        )

        expect(feedManager.subscribeMarket).not.toHaveBeenCalled()
    });

    it("is idempotent — duplicate subscribe is a noop", async () => {
        session.addSubscription("TATA-INR");
        await handleMessage(JSON.stringify({
            type: "subscribe",
            market: "TATA-INR"
        }),
            session,
            feedManager as any);

        expect(feedManager.subscribeMarket).not.toHaveBeenCalled();
    });

    it("calls unsubscribeMarket with stable onEvent reference", async () => {
        session.addSubscription("TATA-INR");

        await handleMessage(JSON.stringify({
            type: "unsubscribe",
            market: "TATA-INR"
        }),
            session,
            feedManager as any)

        expect(feedManager.unsubscribeMarket).toHaveBeenCalledWith("TATA-INR", session.onEvent);
    });

    it("is idempotent — unsubscribe on non-subscribed market is a noop", async () => {
        await handleMessage(JSON.stringify({
            type: "unsubscribe",
            market: "TATA-INR"
        }),
            session,
            feedManager as any);

        expect(feedManager.unsubscribeMarket).not.toHaveBeenCalled()
    });
});
