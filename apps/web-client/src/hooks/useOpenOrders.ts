import { useCallback, useReducer } from "react";
import type { Side, WireBookDeltaPayload } from "../types/wire";
import { clampMinBigInt, parseBigIntDecimal } from "../lib/bigint";
import { OpenOrderDTO } from "../lib/apiClient";


export type OpenOrderStatus = "SUBMITTING" | "OPEN";

const MAX_SEEN_EVENT_IDS = 2000

export type OpenOrder = {
    orderId: string;
    commandId: string | null;
    side: Side;
    price: string;
    originalQty: string;
    remainingQty: string;
    status: OpenOrderStatus;
    createdAtMs: number;
};

type State = {
    orders: OpenOrder[];
    seenEventIds: Set<string>
};

type Action =
    | { type: "RESET" }
    | {
        type: "ADD_OPTIMISTIC";
        order: { orderId: string; side: Side; price: string; qty: string; createdAtMs: number };
    }
    | { type: "ACK_ACCEPTED"; orderId: string; commandId: string }
    | { type: "REMOVE_BY_ORDER_ID"; orderId: string }
    | { type: "REMOVE_BY_COMMAND_ID"; commandId: string }
    | { type: "APPLY_DELTA"; delta: WireBookDeltaPayload; eventId?: string }
    | { type: "SEED"; orders: OpenOrder[] }

const initialState: State = {
    orders: [],
    seenEventIds: new Set()
};

function applyFillToOrder(order: OpenOrder, fillQty: string): OpenOrder | null {
    const remaining = parseBigIntDecimal(order.remainingQty);
    const filled = parseBigIntDecimal(fillQty);
    const nextRemaining = clampMinBigInt(remaining - filled, 0n);

    if (nextRemaining === 0n) return null;
    return { ...order, remainingQty: nextRemaining.toString() };
}

function reducer(state: State, action: Action): State {
    if (action.type === "RESET") return initialState;

    if (action.type === "SEED") {
        return { ...initialState, orders: action.orders }
    }

    if (action.type === "ADD_OPTIMISTIC") {
        const next: OpenOrder = {
            orderId: action.order.orderId,
            commandId: null,
            side: action.order.side,
            price: action.order.price,
            originalQty: action.order.qty,
            remainingQty: action.order.qty,
            status: "SUBMITTING",
            createdAtMs: action.order.createdAtMs,
        };
        return { ...state, orders: [...state.orders, next] };
    }

    if (action.type === "ACK_ACCEPTED") {
        return {
            ...state,
            orders: state.orders.map((order) => {
                if (order.orderId !== action.orderId) return order;
                return { ...order, commandId: action.commandId };
            }),
        };
    }

    if (action.type === "REMOVE_BY_ORDER_ID") {
        return { ...state, orders: state.orders.filter((order) => order.orderId !== action.orderId) };
    }

    if (action.type === "REMOVE_BY_COMMAND_ID") {
        return {
            ...state,
            orders: state.orders.filter((order) => order.commandId !== action.commandId),
        };
    }

    if (action.type === "APPLY_DELTA") {
        const delta = action.delta;

        if (action.eventId && state.seenEventIds.has(action.eventId)) return state;

        const seenEventIds = new Set(state.seenEventIds);
        if (action.eventId) {
            seenEventIds.add(action.eventId)
            if (seenEventIds.size > MAX_SEEN_EVENT_IDS) {
                seenEventIds.delete(seenEventIds.values().next().value!)
            }
        }

        if (delta.type === "ADD") {
            return {
                ...state,
                seenEventIds,
                orders: state.orders.map((order) => {
                    if (order.orderId !== delta.orderId) return order;
                    return {
                        ...order,
                        side: delta.side,
                        price: delta.price,
                        remainingQty: delta.qty,
                        status: "OPEN",
                    };
                }),
            };
        }

        if (delta.type === "CANCEL") {
            return {
                ...state,
                seenEventIds,
                orders: state.orders.filter((order) => order.orderId !== delta.orderId),
            };
        }

        if (delta.type === "FILL") {
            const { makerOrderId, takerOrderId, qty } = delta;

            const nextOrders: OpenOrder[] = [];
            for (const order of state.orders) {
                if (order.orderId === makerOrderId || order.orderId === takerOrderId) {
                    const updated = applyFillToOrder(order, qty);
                    if (updated) nextOrders.push(updated);
                    continue;
                }
                nextOrders.push(order);
            }
            return {
                ...state,
                seenEventIds,
                orders: nextOrders
            };
        }

        if (delta.type === "MARKET_ORDER_SETTLED") {
            return {
                ...state,
                seenEventIds,
                orders: state.orders.filter((order) => order.orderId !== delta.orderId),
            }
        }

        return state;
    }

    return state;
}

export function dbOrderToOpenOrder(dto: OpenOrderDTO): OpenOrder {
    const remainingQty = (BigInt(dto.qty) - BigInt(dto.filledQty)).toString()
    return {
        orderId: dto.orderId,
        commandId: dto.commandId,
        side: dto.side,
        price: dto.price,
        originalQty: dto.qty,
        remainingQty,
        status: dto.status === "PENDING" ? "SUBMITTING" : "OPEN",
        createdAtMs: dto.createdAtMs,
    }
}

export type UseOpenOrdersResult = {
    openOrders: OpenOrder[];
    addOptimistic: (params: { orderId: string; side: Side; price: string; qty: string }) => void;
    ackAccepted: (params: { orderId: string; commandId: string }) => void;
    removeByOrderId: (orderId: string) => void;
    removeByCommandId: (commandId: string) => void;
    applyDelta: (delta: WireBookDeltaPayload, eventId?: string) => void;
    reset: () => void;
    seedFromDB: (dtos: OpenOrderDTO[]) => void
};

export function useOpenOrders(): UseOpenOrdersResult {
    const [state, dispatch] = useReducer(reducer, initialState);

    const addOptimistic = useCallback(
        (params: { orderId: string; side: Side; price: string; qty: string }): void => {
            dispatch({
                type: "ADD_OPTIMISTIC",
                order: { ...params, createdAtMs: Date.now() },
            });
        },
        [],
    );

    const ackAccepted = useCallback((params: { orderId: string; commandId: string }): void => {
        dispatch({ type: "ACK_ACCEPTED", orderId: params.orderId, commandId: params.commandId });
    }, []);

    const removeByOrderId = useCallback((orderId: string): void => {
        dispatch({ type: "REMOVE_BY_ORDER_ID", orderId });
    }, []);

    const removeByCommandId = useCallback((commandId: string): void => {
        dispatch({ type: "REMOVE_BY_COMMAND_ID", commandId });
    }, []);

    const applyDelta = useCallback((delta: WireBookDeltaPayload, eventId?: string): void => {
        dispatch({ type: "APPLY_DELTA", delta, eventId });
    }, []);

    const reset = useCallback((): void => {
        dispatch({ type: "RESET" });
    }, []);

    const seedFromDB = useCallback((dtos: OpenOrderDTO[]): void => {
        dispatch({ type: "SEED", orders: dtos.map(dbOrderToOpenOrder) })
    }, [])

    return {
        openOrders: state.orders,
        addOptimistic,
        ackAccepted,
        removeByOrderId,
        removeByCommandId,
        applyDelta,
        seedFromDB,
        reset,
    };
}