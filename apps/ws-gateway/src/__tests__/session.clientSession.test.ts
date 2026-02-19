import { describe, it, expect, vi } from "vitest";
import WebSocket from "ws";
import { ClientSession } from "../session/ClientSession";

function makeMockSocket(readyState: number = WebSocket.OPEN): WebSocket {
    return { readyState, send: vi.fn(), close: vi.fn(), on: vi.fn() } as unknown as WebSocket;
}

describe("ClientSession", () => {
    it("canSubscribe() returns false when subscriptions reach MAX (10)", () => {
        const session = new ClientSession(makeMockSocket());

        for (let i = 0; i < 10; i++) session.addSubscription(`mkt-${i}`);

        expect(session.canSubscribe()).toBe(false);
    });

    it("canSubscribe() returns true when below MAX", () => {
        const session = new ClientSession(makeMockSocket());

        for (let i = 0; i < 9; i++) session.addSubscription(`mkt-${i}`);

        expect(session.canSubscribe()).toBe(true);
    });

    it("onEvent is a stable reference across multiple property accesses", () => {
        const session = new ClientSession(makeMockSocket());

        expect(session.onEvent).toBe(session.onEvent);
    });

    it("send() is a no-op when socket is CLOSED", () => {
        const socket = makeMockSocket(WebSocket.CLOSED);
        const session = new ClientSession(socket);

        session.sendError("test");
        expect(socket.send).not.toHaveBeenCalled();
    });

    it("onEvent serializes bigint fields as decimal strings", () => {
        const socket = makeMockSocket();
        const session = new ClientSession(socket);
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
