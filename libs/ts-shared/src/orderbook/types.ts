export type Side = "BUY" | "SELL";
export type OrderId = string;
export type MarketId = string;

export type Price = bigint;
export type Qty = bigint;
export type Seq = bigint;

export interface PlaceLimitInput {
    market: MarketId;
    orderId: OrderId;
    side: Side;
    price: Price;
    qty: Qty;
    seq: Seq
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
        seq: Seq
    };

export interface PlaceLimitResult {
    trades: Trade[];
    deltas: BookDelta[];
    remainingQty: Qty
}

export interface CancelResult {
    cancelled: boolean;
    deltas: BookDelta[]
}

export interface RestingOrder {
    orderId: OrderId;
    side: Side;
    price: Price;
    qtyRemaining: Qty;
    seq: Seq
}