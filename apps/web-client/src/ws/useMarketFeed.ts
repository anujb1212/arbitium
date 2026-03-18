import { useEffect, useRef, useCallback } from "react";
import type { WireEventEnvelope, WsServerMessage } from "../types/wire";
import { getStoredToken } from "../lib/auth";

const BASE_DELAY_MS = 500
const MAX_DELAY_MS = 30_000

export type FeedCallback = (event: WireEventEnvelope) => void

export function useMarketFeed(
    market: string,
    onEvent: FeedCallback,
    resumeFromEventId?: string): {
        registerCommandId: (commandId: string) => void
    } {
    const wsRef = useRef<WebSocket | null>(null)
    const lastSeenEventIdRef = useRef<string | null>(resumeFromEventId ?? null)
    const reconnectDelayRef = useRef(BASE_DELAY_MS)
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const onEventRef = useRef(onEvent)
    const shouldStopRef = useRef(false)

    const registerCommandId = useCallback((commandId: string): void => {
        const ws = wsRef.current
        if (ws !== null && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "register_command", commandId }))
        }
    }, [])

    useEffect(() => {
        onEventRef.current = onEvent
    }, [onEvent])

    const connect = useCallback((): void => {
        if (shouldStopRef.current) return

        const token = getStoredToken()
        if (!token) {
            reconnectTimerRef.current = setTimeout(connect, BASE_DELAY_MS)
            return
        }
        const wsUrl = `${import.meta.env.VITE_WS_URL}?token=${encodeURIComponent(token)}`
        const ws = new WebSocket(wsUrl)

        wsRef.current = ws

        ws.onopen = (): void => {
            reconnectDelayRef.current = BASE_DELAY_MS
            ws.send(JSON.stringify({
                type: "subscribe",
                market,
                fromEventId: lastSeenEventIdRef.current
            }))
        }

        ws.onmessage = (event: MessageEvent): void => {
            let msg: WsServerMessage
            try {
                msg = JSON.parse(event.data as string) as WsServerMessage
            } catch {
                return
            }

            if (msg.type === "event") {
                if (msg.data.eventId) lastSeenEventIdRef.current = msg.data.eventId
                onEventRef.current(msg.data)
            }
        }

        ws.onerror = (): void => {
            ws.close()
        }

        ws.onclose = (event: CloseEvent): void => {
            if (event.code === 4001) {
                console.error("[ws] auth rejected — token invalid or expired")
                return
            }
            if (shouldStopRef.current) return
            const delay = reconnectDelayRef.current
            reconnectDelayRef.current = Math.min(delay * 2, MAX_DELAY_MS)
            reconnectTimerRef.current = setTimeout(connect, delay)
        }

    }, [market])

    useEffect(() => {
        shouldStopRef.current = false
        connect()

        return (): void => {
            shouldStopRef.current = true

            if (reconnectTimerRef.current !== null) {
                clearTimeout(reconnectTimerRef.current)
                reconnectTimerRef.current = null
            }

            const ws = wsRef.current
            if (ws !== null) {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                        type: "unsubscribe",
                        market
                    }))
                }
                ws.close()
                wsRef.current = null
            }
        }
    }, [connect, market])

    return { registerCommandId }
}