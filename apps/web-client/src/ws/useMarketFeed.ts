import { useEffect, useRef, useCallback } from "react";
import type { WireEventEnvelope, WsServerMessage } from "../types/wire";

const WS_URL: string = import.meta.env.VITE_WS_URL;
const BASE_DELAY_MS = 500
const MAX_DELAY_MS = 30_000

export type FeedCallback = (event: WireEventEnvelope) => void

export function useMarketFeed(market: string, onEvent: FeedCallback): void {
    const wsRef = useRef<WebSocket | null>(null)
    const reconnectDelayRef = useRef(BASE_DELAY_MS)
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const onEventRef = useRef(onEvent)
    const shouldStopRef = useRef(false)

    useEffect(() => {
        onEventRef.current = onEvent
    }, [])

    const connect = useCallback((): void => {
        if (shouldStopRef.current) return

        const ws = new WebSocket(WS_URL)
        wsRef.current = ws

        ws.onopen = (): void => {
            reconnectDelayRef.current = BASE_DELAY_MS
            ws.send(JSON.stringify({
                type: "subscribe",
                market
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
                onEventRef.current(msg.data)
            }
        }

        ws.onerror = (): void => {
            ws.close()
        }

        ws.onclose = (): void => {
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
}