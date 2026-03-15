export type Side = "BUY" | "SELL";
export type OrderId = string;
export type MarketId = string;

export type RejectReason = "MARKET_MISMATCH" | "SEQ_OUT_OF_ORDER" | "DUPLICATE_ORDER_ID" | "INVALID_PRICE" | "INVALID_QTY" | "UNKNOWN_ORDER_ID" | "SELF_TRADE" | "NO_LIQUIDITY"

export type Price = bigint;
export type Qty = bigint;
export type Seq = bigint;

export interface PlaceLimitInput {
    market: MarketId;
    orderId: OrderId;
    userId: string;
    side: Side;
    price: Price;
    qty: Qty;
    seq: Seq
}

export interface PlaceMarketInput {
    market: MarketId;
    orderId: OrderId;
    userId: string;
    side: Side;
    qty: Qty;
    seq: Seq;
}

export interface CancelInput {
    market: MarketId;
    orderId: OrderId;
    seq: Seq
}

export interface Trade {
    market: MarketId;
    takerOrderId: OrderId;
    makerOrderId: OrderId;
    price: Price;
    qty: Qty;
    takerSide: Side;
    seq: Seq
}

export type BookDelta =
    | {
        type: "ADD";
        market: MarketId;
        orderId: OrderId;
        side: Side;
        price: Price;
        qty: Qty;
        seq: Seq
    }
    | {
        type: "FILL";
        market: MarketId;
        makerOrderId: OrderId;
        takerOrderId: OrderId;
        price: Price;
        qty: Qty;
        seq: Seq
    }
    | {
        type: "CANCEL";
        market: MarketId;
        orderId: OrderId;
        side: Side;
        price: Price;
        qty: Qty;
        seq: Seq
    }
    | {
        type: "MARKET_ORDER_SETTLED";
        market: MarketId;
        orderId: OrderId;
        seq: Seq
    };

export interface PlaceLimitResult {
    accepted: boolean;
    rejectReason?: RejectReason;
    trades: Trade[];
    deltas: BookDelta[];
    remainingQty: Qty
}

export interface PlaceMarketResult {
    accepted: boolean;
    rejectReason?: RejectReason;
    trades: Trade[];
    deltas: BookDelta[];
    filledQty: Qty;
    remainingQty: Qty;
}

export interface CancelResult {
    accepted: boolean;
    rejectReason?: RejectReason;
    cancelled: boolean;
    deltas: BookDelta[]
}

export interface RestingOrder {
    orderId: OrderId;
    userId: string;
    side: Side;
    price: Price;
    qtyRemaining: Qty;
    seq: Seq
}