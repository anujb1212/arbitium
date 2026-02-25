import { useReducer, useCallback, useRef } from "react";
import type { WireTradePayload, Side } from "../types/wire";

export type TradeEntry = {
    id: string;
    price: string;
    qty: string;
    takerSide: Side;
    timestamp: number;
};

type Action = { type: "ADD"; trade: TradeEntry } | { type: "RESET" };

const MAX_TRADES = 50;

function reducer(state: TradeEntry[], action: Action): TradeEntry[] {
    if (action.type === "RESET") return [];
    return [action.trade, ...state].slice(0, MAX_TRADES);
}

export type UseTradeFeedResult = {
    trades: TradeEntry[];
    dispatchTrade: (payload: WireTradePayload) => void;
    resetFeed: () => void;
};

export function useTradeFeed(): UseTradeFeedResult {
    const [trades, dispatch] = useReducer(reducer, []);
    const counterRef = useRef(0)

    const dispatchTrade = useCallback((payload: WireTradePayload): void => {
        counterRef.current += 1
        dispatch({
            type: "ADD",
            trade: {
                id: `${payload.takerOrderId}:${payload.makerOrderId}:${Date.now()}-${counterRef.current}`,
                price: payload.price,
                qty: payload.qty,
                takerSide: payload.takerSide,
                timestamp: Date.now(),
            },
        });
    }, []);

    const resetFeed = useCallback((): void => {
        dispatch({ type: "RESET" });
    }, []);

    return { trades, dispatchTrade, resetFeed };
}
