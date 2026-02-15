import { MarketId, OrderId, Price, Qty, RejectReason, Seq, Side } from "../orderbook/types";

export type CommandKind = "PLACE_LIMIT" | "CANCEL";

export type PlaceLimitCommandPayload = {
    orderId: OrderId;
    side: Side;
    price: Price;
    qty: Qty;
};

export type CancelCommandPayload = {
    orderId: OrderId;
};

export type CommandEnvelope =
    | {
        commandId: string;
        market: MarketId;
        kind: "PLACE_LIMIT";
        payload: PlaceLimitCommandPayload;
    }
    | {
        commandId: string;
        market: MarketId;
        kind: "CANCEL";
        payload: CancelCommandPayload;
    };

export type EventKind = "TRADE" | "BOOK_DELTA" | "COMMAND_REJECTED";

export type TradeEventPayload = {
    takerOrderId: OrderId;
    makerOrderId: OrderId;
    price: Price;
    qty: Qty;
    takerSide: Side;
};

export type BookDeltaPayload =
    | {
        type: "ADD";
        orderId: OrderId;
        side: Side;
        price: Price;
        qty: Qty;
    }
    | {
        type: "FILL";
        makerOrderId: OrderId;
        takerOrderId: OrderId;
        price: Price;
        qty: Qty;
    }
    | {
        type: "CANCEL";
        orderId: OrderId;
    };

export type CommandRejectedPayload = {
    commandKind: CommandKind;
    rejectReason: RejectReason;
};

export type EventEnvelope =
    | {
        market: MarketId;
        kind: "TRADE";
        bookSeq: Seq;
        payload: TradeEventPayload;
        commandId?: string;
        eventId?: string;
    }
    | {
        market: MarketId;
        kind: "BOOK_DELTA";
        bookSeq: Seq;
        payload: BookDeltaPayload;
        commandId?: string;
        eventId?: string;
    }
    | {
        market: MarketId;
        kind: "COMMAND_REJECTED";
        payload: CommandRejectedPayload;
        commandId?: string;
        eventId?: string;
    };