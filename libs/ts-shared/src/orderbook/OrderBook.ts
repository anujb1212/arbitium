import { CancelInput, CancelResult, PlaceLimitInput, PlaceLimitResult, Price, Qty, Side, OrderId, Seq } from "./types";

type RestingOrder = {
    orderId: OrderId;
    side: Side;
    price: Price;
    qtyRemaining: Qty;
    seq: Seq
}

type PriceLevel = {
    q: RestingOrder[];
    head: number
}

export class OrderBook {
    constructor(readonly market: string) { }

    private bids = new Map<Price, PriceLevel>()
    private asks = new Map<Price, PriceLevel>()

    private bidPrices: Price[] = [] //desc
    private askPrices: Price[] = [] //asc

    private ordersById = new Map<OrderId, RestingOrder>()

    private insertAskPrice(price: Price): void {
        const arr = this.askPrices;

        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === price) return
        }
        //asc
        for (let i = 0; i < arr.length; i++) {
            if (price < arr[i]) {
                arr.splice(i, 0, price)
                return
            }
        }

        arr.push(price)
    }

    private insertBidPrice(price: Price): void {
        const arr = this.bidPrices

        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === price) return
        }
        //desc
        for (let i = 0; i < arr.length; i++) {
            if (price > arr[i]) {
                arr.splice(i, 0, price)
                return
            }
        }

        arr.push(price)
    }

    private removeAskPrice(price: Price): void {
        const arr = this.askPrices
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === price) {
                arr.splice(i, 1)
                return
            }
        }
    }

    private removeBidPrice(price: Price): void {
        const arr = this.bidPrices
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === price) {
                arr.splice(i, 1)
                return
            }
        }
    }

    private ensureMarket(market: string): void {
        if (market !== this.market) throw new Error("Market Mismatch");
    }

    private assertValidLimit(price: Price, qty: Qty): void {
        if (price <= 0n) throw new Error("Invalid price");
        if (qty <= 0n) throw new Error("Invalid qty");
    }

    private getOrCreateLevel(map: Map<Price, PriceLevel>, price: Price): PriceLevel {
        const existing = map.get(price);
        if (existing) return existing;

        //create level
        const level: PriceLevel = {
            q: [],
            head: 0
        };
        map.set(price, level);
        return level;
    }

    //Core APIs  
    placeLimit(input: PlaceLimitInput): PlaceLimitResult {
        this.ensureMarket(input.market);
        this.assertValidLimit(input.price, input.qty);

        if (this.ordersById.has(input.orderId)) throw new Error("Duplicate Order ID");

        const order: RestingOrder = {
            orderId: input.orderId,
            side: input.side,
            price: input.price,
            qtyRemaining: input.qty,
            seq: input.seq
        }

        if (input.side == "BUY") {
            const level = this.getOrCreateLevel(this.bids, input.price);
            level.q.push(order);
            this.insertBidPrice(input.price);
        } else {
            const level = this.getOrCreateLevel(this.asks, input.price);
            level.q.push(order);
            this.insertAskPrice(input.price);
        }

        this.ordersById.set(order.orderId, order);

        return {
            trades: [],
            deltas: [{
                type: "ADD",
                market: input.market,
                orderId: input.orderId,
                side: input.side,
                price: input.price,
                qty: input.qty,
                seq: input.seq
            }],
            remainingQty: input.qty
        }
    }

    cancel(input: CancelInput): CancelResult {
        this.ensureMarket(input.market);

        const order = this.ordersById.get(input.orderId);
        if (!order) return {
            cancelled: false,
            deltas: []
        }

        this.ordersById.delete(input.orderId);

        const map = order.side === "BUY" ? this.bids : this.asks;
        const level = map.get(order.price);
        if (level) {
            //removal from queue
            for (let i = level.head; i < level.q.length; i++) {
                if (level.q[i]?.orderId === order.orderId) {
                    level.q.splice(i, 1);
                    break;
                }
            }

            //cleanup if empty
            if (level.head >= level.q.length) {
                map.delete(order.price);
                if (order.side === "BUY") this.removeBidPrice(order.price);
                else this.removeAskPrice(order.price);
            }
        }

        return {
            cancelled: true,
            deltas: [{
                type: "CANCEL",
                market: input.market,
                orderId: input.orderId,
                seq: input.seq
            }]
        }
    }

    //Getters (for testing)
    getBestBid(): Price | null {
        return this.bidPrices[0] ?? null;
    }

    getBestAsk(): Price | null {
        return this.askPrices[0] ?? null;
    }

    getOrder(orderId: OrderId): RestingOrder | null {
        return this.ordersById.get(orderId) ?? null
    };
}
