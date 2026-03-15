import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import WebSocket from "ws";
import { ClientSession } from "../session/ClientSession";
import { handleMessage, parseKnownMarkets } from "../session/messageHandler";


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


    afterEach(() => {
        delete process.env.MARKETS;
    });


    beforeEach(() => {
        socket = makeMockSocket();
        session = new ClientSession(socket, "user-1");
        feedManager = makeMockFeedManager();
    });


    it("sends INVALID_MESSAGE for non-JSON input", async () => {
        await handleMessage("not-json", session, feedManager as any);

        expect(socket.send).toHaveBeenCalledWith(
            JSON.stringify({ type: "error", message: "INVALID_MESSAGE" })
        );
    });


    it("sends INVALID_MESSAGE when market field is missing", async () => {
        await handleMessage(JSON.stringify({ type: "subscribe" }), session, feedManager as any);

        expect(socket.send).toHaveBeenCalledWith(
            JSON.stringify({ type: "error", message: "INVALID_MESSAGE" })
        );
    });


    it("sends INVALID_MESSAGE when market exceeds 64 chars", async () => {
        const market = "a".repeat(65);
        await handleMessage(JSON.stringify({ type: "subscribe", market }), session, feedManager as any);

        expect(socket.send).toHaveBeenCalledWith(
            JSON.stringify({ type: "error", message: "INVALID_MESSAGE" })
        );
    });


    it("sends UNKNOWN_MARKET when market is not in known list", async () => {
        await handleMessage(
            JSON.stringify({ type: "subscribe", market: "FAKE-INR" }),
            session,
            feedManager as any
        );

        expect(socket.send).toHaveBeenCalledWith(
            JSON.stringify({ type: "error", message: "UNKNOWN_MARKET" })
        );
        expect(feedManager.subscribeMarket).not.toHaveBeenCalled();
    });


    it("calls subscribeMarket with stable onEvent reference", async () => {
        await handleMessage(
            JSON.stringify({ type: "subscribe", market: "TATA-INR" }),
            session,
            feedManager as any
        );

        expect(feedManager.subscribeMarket).toHaveBeenCalledWith("TATA-INR", session.onEvent, undefined);
    });


    it("sends SUBSCRIPTION_LIMIT_REACHED when at cap", async () => {
        for (let i = 0; i < 10; i++) session.addSubscription(`mkt-${i}`);

        await handleMessage(
            JSON.stringify({ type: "subscribe", market: "TATA-INR" }),
            session,
            feedManager as any
        );

        expect(socket.send).toHaveBeenCalledWith(
            JSON.stringify({ type: "error", message: "SUBSCRIPTION_LIMIT_REACHED" })
        );
        expect(feedManager.subscribeMarket).not.toHaveBeenCalled();
    });


    it("is idempotent — duplicate subscribe is a noop", async () => {
        session.addSubscription("TATA-INR");

        await handleMessage(
            JSON.stringify({ type: "subscribe", market: "TATA-INR" }),
            session,
            feedManager as any
        );

        expect(feedManager.subscribeMarket).not.toHaveBeenCalled();
    });


    it("calls unsubscribeMarket with stable onEvent reference", async () => {
        session.addSubscription("TATA-INR");

        await handleMessage(
            JSON.stringify({ type: "unsubscribe", market: "TATA-INR" }),
            session,
            feedManager as any
        );

        expect(feedManager.unsubscribeMarket).toHaveBeenCalledWith("TATA-INR", session.onEvent);
    });


    it("is idempotent — unsubscribe on non-subscribed market is a noop", async () => {
        await handleMessage(
            JSON.stringify({ type: "unsubscribe", market: "TATA-INR" }),
            session,
            feedManager as any
        );

        expect(feedManager.unsubscribeMarket).not.toHaveBeenCalled();
    });


    it("trims incoming market before subscribe", async () => {
        await handleMessage(
            JSON.stringify({ type: "subscribe", market: "  TATA-INR  " }),
            session,
            feedManager as any
        );

        expect(feedManager.subscribeMarket).toHaveBeenCalledWith("TATA-INR", session.onEvent, undefined);
        expect(session.isSubscribed("TATA-INR")).toBe(true);
    });


    it("register_command registers commandId — COMMAND_REJECTED forwarded to session", async () => {
        const commandId = crypto.randomUUID();
        await handleMessage(
            JSON.stringify({ type: "register_command", commandId }),
            session,
            feedManager as any
        );

        const mockSend = socket.send as ReturnType<typeof vi.fn>;
        mockSend.mockClear();

        session.onEvent({
            market: "TATA-INR",
            kind: "COMMAND_REJECTED",
            commandId,
            payload: { commandKind: "PLACE_LIMIT", rejectReason: "DUPLICATE_ORDER_ID" },
        } as any);

        expect(mockSend).toHaveBeenCalledOnce();
    });


    it("register_command rejects malformed commandId (not UUID format)", async () => {
        await handleMessage(
            JSON.stringify({ type: "register_command", commandId: "not-a-uuid" }),
            session,
            feedManager as any
        );

        expect(socket.send).toHaveBeenCalledWith(
            JSON.stringify({ type: "error", message: "INVALID_MESSAGE" })
        );
    });


    it("COMMAND_REJECTED not forwarded when commandId not registered", async () => {
        const mockSend = socket.send as ReturnType<typeof vi.fn>;

        session.onEvent({
            market: "TATA-INR",
            kind: "COMMAND_REJECTED",
            commandId: crypto.randomUUID(),
            payload: { commandKind: "PLACE_LIMIT", rejectReason: "DUPLICATE_ORDER_ID" },
        } as any);

        expect(mockSend).not.toHaveBeenCalled();
    });


    it("parseKnownMarkets trims spaced env values", () => {
        const knownMarkets = parseKnownMarkets("TATA-INR, RELIANCE-INR, INFY-INR");

        expect(knownMarkets.has("TATA-INR")).toBe(true);
        expect(knownMarkets.has("RELIANCE-INR")).toBe(true);
        expect(knownMarkets.has("INFY-INR")).toBe(true);
    });
});
