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
    private bids = new Map<Price, PriceLevel>();
    private asks = new Map<Price, PriceLevel>();

    private bidPrices: Price[] = []; //desc
    private askPrices: Price[] = []; //asc

    private ordersById = new Map<OrderId, RestingOrder>();

    constructor(readonly market: string) { }

    //Core APIs  
    placeLimit(input: PlaceLimitInput): PlaceLimitResult {
        this.ensureMarket(input.market);
        this.assertValidLimit(input.price, input.qty);

        if (this.ordersById.has(input.orderId)) throw new Error("Duplicate Order ID");

        let remainingQty: Qty = input.qty;
        const trades: PlaceLimitResult["trades"] = [];
        const deltas: PlaceLimitResult["deltas"] = [];

        //Match against opp side
        if (input.side === "BUY") {
            remainingQty = this.matchTakerBuy(input, remainingQty, trades, deltas);
        } else {
            remainingQty = this.matchTakerSell(input, remainingQty, trades, deltas);
        }

        if (remainingQty > 0n) {
            const restingOrder: RestingOrder = {
                orderId: input.orderId,
                side: input.side,
                price: input.price,
                qtyRemaining: remainingQty,
                seq: input.seq
            }

            if (input.side === "BUY") {
                const level = this.getOrCreateLevel(this.bids, input.price);
                level.q.push(restingOrder);
                this.insertBidPrice(input.price);
            } else {
                const level = this.getOrCreateLevel(this.asks, input.price);
                level.q.push(restingOrder);
                this.insertAskPrice(input.price);
            }

            this.ordersById.set(restingOrder.orderId, restingOrder);

            deltas.push({
                type: "ADD",
                market: input.market,
                orderId: input.orderId,
                side: input.side,
                price: input.price,
                qty: remainingQty,
                seq: input.seq
            })

        }

        return { trades, deltas, remainingQty }
    }

    cancel(input: CancelInput): CancelResult {
        this.ensureMarket(input.market);

        const restingOrder = this.ordersById.get(input.orderId);
        if (!restingOrder) return { cancelled: false, deltas: [] };

        //authoritative cancel
        this.ordersById.delete(input.orderId);

        const bookSide = restingOrder.side === "BUY" ? this.bids : this.asks;
        const priceLevel = bookSide.get(restingOrder.price);

        if (priceLevel) {
            for (let queueIndex = priceLevel.head; queueIndex < priceLevel.q.length; queueIndex++) {
                const queuedOrder = priceLevel.q[queueIndex]!;
                if (queuedOrder.orderId === restingOrder.orderId) {
                    priceLevel.q.splice(queueIndex, 1);
                    break;
                }
            }

            this.cleanupLevelIfEmpty(restingOrder.side, restingOrder.price);
        }

        return {
            cancelled: true,
            deltas: [{
                type: "CANCEL",
                market: input.market,
                orderId: input.orderId,
                seq: input.seq
            }]
        };
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
    }

    //matching helpers
    private matchTakerBuy(
        input: PlaceLimitInput,
        remainingQty: Qty,
        trades: PlaceLimitResult["trades"],
        deltas: PlaceLimitResult["deltas"]
    ): Qty {
        while (remainingQty > 0n) {
            const bestAskPrice = this.getBestAsk();
            if (bestAskPrice === null) break;
            if (bestAskPrice > input.price) break;

            const askLevel = this.asks.get(bestAskPrice);
            if (!askLevel) {
                this.removeAskPrice(bestAskPrice);
                continue;
            }

            const makerOrder = this.peekFrontOrder(askLevel);
            if (!makerOrder) {
                this.cleanupLevelIfEmpty("SELL", bestAskPrice);
                continue;
            }

            const fillQty = makerOrder.qtyRemaining < remainingQty
                ? makerOrder.qtyRemaining
                : remainingQty;

            makerOrder.qtyRemaining -= fillQty; //order maker
            remainingQty -= fillQty;            //order taker

            trades.push({
                market: input.market,
                takerOrderId: input.orderId,
                makerOrderId: makerOrder.orderId,
                price: makerOrder.price,
                qty: fillQty,
                takerSide: "BUY",
                seq: input.seq
            });

            deltas.push({
                type: "FILL",
                market: input.market,
                makerOrderId: makerOrder.orderId,
                takerOrderId: input.orderId,
                price: makerOrder.price,
                qty: fillQty,
                seq: input.seq
            });

            if (makerOrder.qtyRemaining === 0n) {
                this.ordersById.delete(makerOrder.orderId);
            }

            this.cleanupLevelIfEmpty("SELL", bestAskPrice);
        }

        return remainingQty;
    }

    private matchTakerSell(
        input: PlaceLimitInput,
        remainingQty: Qty,
        trades: PlaceLimitResult["trades"],
        deltas: PlaceLimitResult["deltas"]
    ): Qty {
        while (remainingQty > 0n) {
            const bestBidPrice = this.getBestBid();
            if (bestBidPrice === null) break;
            if (bestBidPrice < input.price) break;

            const bidLevel = this.bids.get(bestBidPrice);
            if (!bidLevel) {
                this.removeBidPrice(bestBidPrice);
                continue;
            }

            const makerOrder = this.peekFrontOrder(bidLevel);
            if (!makerOrder) {
                this.cleanupLevelIfEmpty("BUY", bestBidPrice);
                continue;
            }

            const fillQty = makerOrder.qtyRemaining < remainingQty
                ? makerOrder.qtyRemaining
                : remainingQty;

            makerOrder.qtyRemaining -= fillQty; //order maker
            remainingQty -= fillQty;            //order taker

            trades.push({
                market: input.market,
                takerOrderId: input.orderId,
                makerOrderId: makerOrder.orderId,
                price: makerOrder.price,
                qty: fillQty,
                takerSide: "SELL",
                seq: input.seq,
            });

            deltas.push({
                type: "FILL",
                market: input.market,
                makerOrderId: makerOrder.orderId,
                takerOrderId: input.orderId,
                price: makerOrder.price,
                qty: fillQty,
                seq: input.seq,
            });

            if (makerOrder.qtyRemaining === 0n) {
                this.ordersById.delete(makerOrder.orderId);
            }

            this.cleanupLevelIfEmpty("BUY", bestBidPrice);
        }

        return remainingQty;
    }

    //infra helpers
    private ensureMarket(market: string): void {
        if (market !== this.market) throw new Error("Market Mismatch");
    }

    private assertValidLimit(price: Price, qty: Qty): void {
        if (price <= 0n) throw new Error("Invalid Price");
        if (qty <= 0n) throw new Error("Invalid Quantity");
    }

    private getOrCreateLevel(map: Map<Price, PriceLevel>, price: Price): PriceLevel {
        const existingLevel = map.get(price);
        if (existingLevel) return existingLevel;

        //create level
        const newlevel: PriceLevel = {
            q: [],
            head: 0
        };
        map.set(price, newlevel);
        return newlevel;
    }

    private peekFrontOrder(level: PriceLevel): RestingOrder | null {
        while (level.head < level.q.length) {
            const frontOrder = level.q[level.head]!;

            if (frontOrder.qtyRemaining > 0n) return frontOrder;
            level.head++;
        }
        return null;
    }

    private cleanupLevelIfEmpty(side: Side, price: Price): void {
        const map = side === "BUY" ? this.bids : this.asks;

        const level = map.get(price);
        if (!level) return;

        while (level.head < level.q.length && level.q[level.head]!.qtyRemaining === 0n) level.head++;

        if (level.head >= level.q.length) {
            map.delete(price);
            if (side === "BUY") this.removeBidPrice(price);
            else this.removeAskPrice(price);
        }
    }

    //price ladder helpers
    private insertAskPrice(price: Price): void {
        const ladder = this.askPrices;

        for (let i = 0; i < ladder.length; i++) {
            if (ladder[i] === price) return
        }
        //asc
        for (let i = 0; i < ladder.length; i++) {
            if (price < ladder[i]) {
                ladder.splice(i, 0, price)
                return
            }
        }

        ladder.push(price)
    }

    private insertBidPrice(price: Price): void {
        const ladder = this.bidPrices

        for (let i = 0; i < ladder.length; i++) {
            if (ladder[i] === price) return
        }
        //desc
        for (let i = 0; i < ladder.length; i++) {
            if (price > ladder[i]) {
                ladder.splice(i, 0, price)
                return
            }
        }

        ladder.push(price)
    }

    private removeAskPrice(price: Price): void {
        const ladder = this.askPrices
        for (let i = 0; i < ladder.length; i++) {
            if (ladder[i] === price) {
                ladder.splice(i, 1)
                return
            }
        }
    }

    private removeBidPrice(price: Price): void {
        const ladder = this.bidPrices
        for (let i = 0; i < ladder.length; i++) {
            if (ladder[i] === price) {
                ladder.splice(i, 1)
                return
            }
        }
    }

}
