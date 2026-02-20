export type Side = "BUY" | "SELL";

export type WireTradePayload = {
    takerOrderId: string;
    makerOrderId: string;
    price: string;
    qty: string;
    takerSide: Side;
};

export type WireBookDeltaPayload =
    | {
        type: "ADD";
        orderId: string;
        side: Side;
        price: string;
        qty: string
    }
    | {
        type: "FILL";
        makerOrderId: string;
        takerOrderId: string;
        price: string;
        qty: string
    }
    | {
        type: "CANCEL";
        orderId: string
    };

export type WireCommandRejectedPayload = {
    commandKind: "PLACE_LIMIT" | "CANCEL";
    rejectReason: string;
};

export type WireEventEnvelope =
    | {
        market: string;
        kind: "TRADE";
        bookSeq: string;
        payload: WireTradePayload;
        commandId?: string;
        eventId?: string
    }
    | {
        market: string;
        kind: "BOOK_DELTA";
        bookSeq: string;
        payload: WireBookDeltaPayload;
        commandId?: string;
        eventId?: string
    }
    | {
        market: string;
        kind: "COMMAND_REJECTED";
        payload: WireCommandRejectedPayload;
        commandId?: string;
        eventId?: string
    };

export type WsServerMessage =
    | {
        type: "event";
        data: WireEventEnvelope
    }
    | {
        type: "error";
        message: string
    };
