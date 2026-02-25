import { useCallback, useReducer } from "react";
import type { WireTradePayload } from "../types/wire";
import { parseBigIntDecimal } from "../lib/bigint";


const WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_SAMPLES_IN_WINDOW = 20_000;
const COMPACT_THRESHOLD = 2_000;

type TradeSample = {
    price: string;
    qty: string;
    timestampMs: number;
};

type Direction = "UP" | "DOWN" | "FLAT";

type State = {
    lastPrice: string | null;
    prevPrice: string | null;
    samples: TradeSample[];
    startIndex: number;
    windowQtySum: bigint;
};

type Action =
    | { type: "RESET" }
    | { type: "ADD_TRADE"; payload: WireTradePayload; nowMs: number };

const initialState: State = {
    lastPrice: null,
    prevPrice: null,
    samples: [],
    startIndex: 0,
    windowQtySum: 0n,
};

function pruneWindow(state: State, nowMs: number): State {
    const windowStart = nowMs - WINDOW_MS;

    let startIndex = state.startIndex;
    let windowQtySum = state.windowQtySum;
    while (startIndex < state.samples.length && state.samples[startIndex].timestampMs < windowStart) {
        windowQtySum -= parseBigIntDecimal(state.samples[startIndex].qty);
        startIndex += 1;
    }
    const liveCount = state.samples.length - startIndex;
    if (liveCount > MAX_SAMPLES_IN_WINDOW) {
        const toDrop = liveCount - MAX_SAMPLES_IN_WINDOW;
        for (let drop = 0; drop < toDrop; drop += 1) {
            windowQtySum -= parseBigIntDecimal(state.samples[startIndex + drop].qty);
        }
        startIndex += toDrop;
    }
    if (startIndex >= COMPACT_THRESHOLD) {
        const compacted = state.samples.slice(startIndex);
        return { ...state, samples: compacted, startIndex: 0, windowQtySum };
    }
    return { ...state, startIndex, windowQtySum };
}

function reducer(state: State, action: Action): State {
    if (action.type === "RESET") return initialState;

    const prevPrice = state.lastPrice;
    const lastPrice = action.payload.price;
    const nowMs = action.nowMs;

    const addedQty = parseBigIntDecimal(action.payload.qty);

    const next: State = {
        ...state,
        prevPrice,
        lastPrice,
        samples: [
            ...state.samples,
            { price: action.payload.price, qty: action.payload.qty, timestampMs: nowMs },
        ],
        windowQtySum: state.windowQtySum + addedQty,
    };
    return pruneWindow(next, nowMs);
}

export type MarketStats = {
    lastPrice: string | null;
    direction: Direction;
    windowOpenPrice: string | null;
    changeBps: bigint | null;
    windowQtySum: string;
};

export type UseMarketStatsResult = {
    stats: MarketStats;
    onTrade: (payload: WireTradePayload) => void;
    reset: () => void;
};

function computeDirection(lastPrice: string | null, prevPrice: string | null): Direction {
    if (!lastPrice || !prevPrice) return "FLAT";
    const last = parseBigIntDecimal(lastPrice);
    const prev = parseBigIntDecimal(prevPrice);
    if (last > prev) return "UP";
    if (last < prev) return "DOWN";
    return "FLAT";
}

function computeChangeBps(lastPrice: string | null, openPrice: string | null): bigint | null {
    if (!lastPrice || !openPrice) return null;
    const last = parseBigIntDecimal(lastPrice);
    const open = parseBigIntDecimal(openPrice);
    if (open === 0n) return null;

    const delta = last - open;
    return (delta * 10000n) / open;
}

export function useMarketStats(): UseMarketStatsResult {
    const [state, dispatch] = useReducer(reducer, initialState);

    const onTrade = useCallback((payload: WireTradePayload): void => {
        dispatch({ type: "ADD_TRADE", payload, nowMs: Date.now() });
    }, []);

    const reset = useCallback((): void => {
        dispatch({ type: "RESET" });
    }, []);

    const windowOpenPrice =
        state.samples.length > state.startIndex ? state.samples[state.startIndex].price : null;

    const stats: MarketStats = {
        lastPrice: state.lastPrice,
        direction: computeDirection(state.lastPrice, state.prevPrice),
        windowOpenPrice,
        changeBps: computeChangeBps(state.lastPrice, windowOpenPrice),
        windowQtySum: state.windowQtySum.toString(),
    };

    return { stats, onTrade, reset };
}