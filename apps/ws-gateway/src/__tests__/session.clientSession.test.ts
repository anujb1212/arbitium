import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import WebSocket from "ws";
import jwt from "jsonwebtoken";
import { verifyConnectionToken } from "../auth/verifyToken";
import { ClientSession } from "../session/ClientSession";

function makeMockSocket(readyState: number = WebSocket.OPEN): WebSocket {
    return { readyState, send: vi.fn(), close: vi.fn(), on: vi.fn() } as unknown as WebSocket;
}

describe("ClientSession", () => {
    it("canSubscribe() returns false when subscriptions reach MAX (10)", () => {
        const session = new ClientSession(makeMockSocket(), "user-1");

        for (let i = 0; i < 10; i++) session.addSubscription(`mkt-${i}`);

        expect(session.canSubscribe()).toBe(false);
    });

    it("canSubscribe() returns true when below MAX", () => {
        const session = new ClientSession(makeMockSocket(), "user-1");

        for (let i = 0; i < 9; i++) session.addSubscription(`mkt-${i}`);

        expect(session.canSubscribe()).toBe(true);
    });

    it("onEvent is a stable reference across multiple property accesses", () => {
        const session = new ClientSession(makeMockSocket(), "user-1");

        expect(session.onEvent).toBe(session.onEvent);
    });

    it("send() is a no-op when socket is CLOSED", () => {
        const socket = makeMockSocket(WebSocket.CLOSED);
        const session = new ClientSession(socket, "user-1");

        session.sendError("test");
        expect(socket.send).not.toHaveBeenCalled();
    });

    it("onEvent serializes bigint fields as decimal strings", () => {
        const socket = makeMockSocket();
        const session = new ClientSession(socket, "user-1");
        const envelope = {
            market: "TATA-INR",
            kind: "TRADE",
            bookSeq: 42n,
            payload: {}
        } as any;
        session.onEvent(envelope);
        const sent = JSON.parse((socket.send as ReturnType<typeof vi.fn>).mock.calls[0][0]);
        expect(sent.data.bookSeq).toBe("42");
        expect(sent.type).toBe("event");
    });
});

describe("ClientSession — userId", () => {
    it("stores and exposes userId passed at construction", () => {
        const session = new ClientSession(makeMockSocket(), "user-abc");
        expect(session.userId).toBe("user-abc");
    });
});

describe("verifyConnectionToken", () => {
    const secret = "test-secret";

    beforeEach(() => {
        vi.stubEnv("JWT_SECRET", secret);
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("returns userId when token is valid", () => {
        const token = jwt.sign({ sub: "user-123" }, secret);
        const result = verifyConnectionToken(token);
        expect(result).toEqual({ userId: "user-123" });
    });

    it("returns null for tampered token", () => {
        const token = jwt.sign({ sub: "user-123" }, "wrong-secret");
        const result = verifyConnectionToken(token);
        expect(result).toBeNull();
    });

    it("returns null when token has no sub field", () => {
        const token = jwt.sign({ uid: "user-123" }, secret);
        const result = verifyConnectionToken(token);
        expect(result).toBeNull();
    });

    it("returns null for expired token", () => {
        const token = jwt.sign({ sub: "user-123" }, secret, { expiresIn: -1 });
        const result = verifyConnectionToken(token);
        expect(result).toBeNull();
    });
});
