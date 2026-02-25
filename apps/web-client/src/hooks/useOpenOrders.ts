import { useCallback, useReducer } from "react";
import type { Side, WireBookDeltaPayload } from "../types/wire";
import { clampMinBigInt, parseBigIntDecimal } from "../lib/bigint";


export type OpenOrderStatus = "SUBMITTING" | "OPEN";

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
    | { type: "APPLY_DELTA"; delta: WireBookDeltaPayload };

const initialState: State = { orders: [] };

function applyFillToOrder(order: OpenOrder, fillQty: string): OpenOrder | null {
    const remaining = parseBigIntDecimal(order.remainingQty);
    const filled = parseBigIntDecimal(fillQty);
    const nextRemaining = clampMinBigInt(remaining - filled, 0n);

    if (nextRemaining === 0n) return null;
    return { ...order, remainingQty: nextRemaining.toString() };
}

function reducer(state: State, action: Action): State {
    if (action.type === "RESET") return initialState;

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
                return { ...order, commandId: action.commandId, status: "OPEN" };
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

        if (delta.type === "CANCEL") {
            return {
                ...state,
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
            return { ...state, orders: nextOrders };
        }

        return state;
    }

    return state;
}

export type UseOpenOrdersResult = {
    openOrders: OpenOrder[];
    addOptimistic: (params: { orderId: string; side: Side; price: string; qty: string }) => void;
    ackAccepted: (params: { orderId: string; commandId: string }) => void;
    removeByOrderId: (orderId: string) => void;
    removeByCommandId: (commandId: string) => void;
    applyDelta: (delta: WireBookDeltaPayload) => void;
    reset: () => void;
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

    const applyDelta = useCallback((delta: WireBookDeltaPayload): void => {
        dispatch({ type: "APPLY_DELTA", delta });
    }, []);

    const reset = useCallback((): void => {
        dispatch({ type: "RESET" });
    }, []);

    return {
        openOrders: state.orders,
        addOptimistic,
        ackAccepted,
        removeByOrderId,
        removeByCommandId,
        applyDelta,
        reset,
    };
}