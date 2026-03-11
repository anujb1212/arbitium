import { useReducer, useCallback } from "react";
import type { WireBookDeltaPayload, Side } from "../types/wire";
import { DepthSnapshot } from "../lib/apiClient";

type OrderEntry = { side: Side; price: string; remainingQty: bigint };

type OrderBookState = {
    bids: Map<string, bigint>;
    asks: Map<string, bigint>;
    orderMap: Map<string, OrderEntry>;
};

type Action =
    | { type: "DELTA"; payload: WireBookDeltaPayload }
    | { type: "SEED"; bids: Map<string, bigint>; asks: Map<string, bigint> }
    | { type: "RESET" };

export type DisplayLevel = {
    price: string;
    qty: bigint;
    total: bigint;
    depthPct: number;
};

function createInitialState(): OrderBookState {
    return { bids: new Map(), asks: new Map(), orderMap: new Map() };
}

function decrementLevelQty(
    levels: Map<string, bigint>,
    price: string,
    qtyToRemove: bigint
): void {
    const nextQty = (levels.get(price) ?? 0n) - qtyToRemove;
    if (nextQty <= 0n) levels.delete(price);
    else levels.set(price, nextQty);
}

function applyDelta(state: OrderBookState, payload: WireBookDeltaPayload): OrderBookState {
    const bids = new Map(state.bids);
    const asks = new Map(state.asks);
    const orderMap = new Map(state.orderMap);

    if (payload.type === "ADD") {
        const { orderId, side, price, qty } = payload;
        const qtyBig = BigInt(qty);
        const levels = side === "BUY" ? bids : asks;
        levels.set(price, (levels.get(price) ?? 0n) + qtyBig);
        orderMap.set(orderId, { side, price, remainingQty: qtyBig });
    }

    if (payload.type === "FILL") {
        const { makerOrderId, price, qty } = payload;
        const qtyBig = BigInt(qty);
        const entry = orderMap.get(makerOrderId);

        if (!entry) return { bids, asks, orderMap }

        const levels = entry.side === "BUY" ? bids : asks;
        const newRemaining = entry.remainingQty - qtyBig;

        if (newRemaining <= 0n) orderMap.delete(makerOrderId);
        else orderMap.set(makerOrderId, { ...entry, remainingQty: newRemaining });

        decrementLevelQty(levels, entry.price, qtyBig);
    }

    if (payload.type === "CANCEL") {
        const levels = payload.side === "BUY" ? bids : asks;
        const qtyBig = BigInt(payload.qty);

        decrementLevelQty(levels, payload.price, qtyBig);
        orderMap.delete(payload.orderId);
        return { bids, asks, orderMap };
    }

    return { bids, asks, orderMap };
}

function reducer(state: OrderBookState, action: Action): OrderBookState {
    if (action.type === "SEED") {
        return {
            bids: action.bids,
            asks: action.asks,
            orderMap: new Map()
        }
    }

    if (action.type === "RESET") return createInitialState();
    return applyDelta(state, action.payload);
}

const DISPLAY_LEVELS = 15;

function toDisplayLevels(
    map: Map<string, bigint>,
    side: "BUY" | "SELL",
    limit: number
): DisplayLevel[] {
    const descSorted = Array.from(map.entries()).sort((a, b) => {
        const diff = BigInt(b[0]) - BigInt(a[0]);
        return diff > 0n ? 1 : diff < 0n ? -1 : 0;
    });

    const levels = side === "BUY"
        ? descSorted.slice(0, limit)
        : descSorted.reverse().slice(0, limit);  // ascending for asks

    let running = 0n;
    const withTotals = levels.map(([price, qty]) => {
        running += qty;
        return { price, qty, total: running, depthPct: 0 };
    });

    const maxTotal = withTotals.at(-1)?.total ?? 1n;
    return withTotals.map((lvl) => ({
        ...lvl,
        depthPct: Number((lvl.total * 10000n) / maxTotal) / 100,
    }));
}

export type UseOrderBookResult = {
    bids: DisplayLevel[];
    asks: DisplayLevel[];
    dispatchDelta: (payload: WireBookDeltaPayload) => void;
    resetBook: () => void;
    seedBook: (snapshot: DepthSnapshot) => void
};

export function useOrderBook(): UseOrderBookResult {
    const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

    const seedBook = useCallback((snapshot: DepthSnapshot): void => {
        const bids = new Map<string, bigint>();
        const asks = new Map<string, bigint>();
        for (const { price, qty } of snapshot.bids) bids.set(price, BigInt(qty));
        for (const { price, qty } of snapshot.asks) asks.set(price, BigInt(qty));
        dispatch({ type: "SEED", bids, asks });
    }, [])

    const dispatchDelta = useCallback((payload: WireBookDeltaPayload): void => {
        dispatch({ type: "DELTA", payload });
    }, []);

    const resetBook = useCallback((): void => {
        dispatch({ type: "RESET" });
    }, []);

    return {
        bids: toDisplayLevels(state.bids, "BUY", DISPLAY_LEVELS),
        asks: toDisplayLevels(state.asks, "SELL", DISPLAY_LEVELS),
        dispatchDelta,
        resetBook,
        seedBook
    };
}
