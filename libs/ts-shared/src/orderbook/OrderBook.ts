import { CancelInput, CancelResult, MarketId, OrderId, PlaceLimitInput, PlaceLimitResult, Price, Qty, RestingOrder, Side } from "./types";
import { insertPriceIntoLadder } from "./priceLadder";
import { PriceLevel, prunePriceLevel, removeOrderFromPriceLevel } from "./priceLevelQueue";
import { matchIncomingBuyOrder, matchIncomingSellOrder, createCancelDelta } from "./matching";

export class OrderBook {
    private bids = new Map<Price, PriceLevel>();
    private asks = new Map<Price, PriceLevel>();

    private bidPricesDesc: Price[] = []; //desc
    private askPricesAsc: Price[] = [];  //asc

    private ordersById = new Map<OrderId, RestingOrder>();

    constructor(readonly market: MarketId) { }

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
            remainingQty = matchIncomingBuyOrder({
                input,
                startingRemainingQty: remainingQty,
                asksByPrice: this.asks,
                askPricesAsc: this.askPricesAsc,
                ordersById: this.ordersById,
                trades,
                deltas
            })
        } else {
            remainingQty = matchIncomingSellOrder({
                input,
                startingRemainingQty: remainingQty,
                bidsByPrice: this.bids,
                bidPricesDesc: this.bidPricesDesc,
                ordersById: this.ordersById,
                trades,
                deltas
            })
        }

        if (remainingQty > 0n) {
            const newRestingOrder: RestingOrder = {
                orderId: input.orderId,
                side: input.side,
                price: input.price,
                qtyRemaining: remainingQty,
                seq: input.seq
            }

            if (input.side === "BUY") {
                const bidLevel = this.getOrCreateLevel(this.bids, input.price)
                bidLevel.queue.push(newRestingOrder)
                insertPriceIntoLadder(this.bidPricesDesc, input.price, "DESC")
            } else {
                const askLevel = this.getOrCreateLevel(this.asks, input.price)
                askLevel.queue.push(newRestingOrder)
                insertPriceIntoLadder(this.askPricesAsc, input.price, "ASC")
            }

            this.ordersById.set(newRestingOrder.orderId, newRestingOrder);

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

        if (restingOrder.side === "BUY") {
            const bidLevel = this.bids.get(restingOrder.price)
            if (bidLevel) {
                removeOrderFromPriceLevel(bidLevel, restingOrder.orderId)
            }
            prunePriceLevel({
                levelByPrice: this.bids,
                priceLadder: this.bidPricesDesc,
                price: restingOrder.price
            })
        } else {
            const askLevel = this.asks.get(restingOrder.price)
            if (askLevel) {
                removeOrderFromPriceLevel(askLevel, restingOrder.orderId)
            }
            prunePriceLevel({
                levelByPrice: this.asks,
                priceLadder: this.askPricesAsc,
                price: restingOrder.price
            })
        }

        return {
            cancelled: true,
            deltas: [createCancelDelta({
                market: input.market,
                orderId: input.orderId,
                seq: input.seq
            })]
        };
    }

    //Getters (for testing)
    getBestBid(): Price | null {
        return this.bidPricesDesc[0] ?? null;
    }

    getBestAsk(): Price | null {
        return this.askPricesAsc[0] ?? null;
    }

    getOrder(orderId: OrderId): RestingOrder | null {
        return this.ordersById.get(orderId) ?? null
    }

    //infra helpers
    private ensureMarket(market: MarketId): void {
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
        const newLevel: PriceLevel = {
            queue: [],
            headIndex: 0
        };
        map.set(price, newLevel);
        return newLevel;
    }
}
