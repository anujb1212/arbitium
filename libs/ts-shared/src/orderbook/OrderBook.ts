import { CancelInput, CancelResult, MarketId, OrderId, PlaceLimitInput, PlaceLimitResult, Price, Qty, RejectReason, RestingOrder, Seq } from "./types";
import { insertPriceIntoLadder } from "./priceLadder";
import { PriceLevel, prunePriceLevel, removeOrderFromPriceLevel } from "./priceLevelQueue";
import { matchIncomingBuyOrder, matchIncomingSellOrder, createCancelDelta } from "./matching";

export class OrderBook {
    private bids = new Map<Price, PriceLevel>();
    private asks = new Map<Price, PriceLevel>();

    private bidPricesDesc: Price[] = []; //desc
    private askPricesAsc: Price[] = [];  //asc

    private ordersById = new Map<OrderId, RestingOrder>();
    private lastSeq: Seq = 0n;

    constructor(readonly market: MarketId) { }

    //Core APIs  
    placeLimit(input: PlaceLimitInput): PlaceLimitResult {
        const marketReject = this.validateMarket(input.market)
        if (marketReject) {
            return {
                accepted: false,
                rejectReason: marketReject,
                trades: [],
                deltas: [],
                remainingQty: input.qty
            };
        }

        const seqReject = this.bumpSeq(input.seq);
        if (seqReject) {
            return {
                accepted: false,
                rejectReason: seqReject,
                trades: [],
                deltas: [],
                remainingQty: input.qty
            };
        }


        const limitReject = this.validateLimit(input.price, input.qty);
        if (limitReject) {
            return {
                accepted: false,
                rejectReason: limitReject,
                trades: [],
                deltas: [],
                remainingQty: input.qty
            };
        }

        if (this.ordersById.has(input.orderId)) {
            return {
                accepted: false,
                rejectReason: "DUPLICATE_ORDER_ID",
                trades: [],
                deltas: [],
                remainingQty: input.qty
            };
        }

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

        return { accepted: true, trades, deltas, remainingQty }
    }

    cancel(input: CancelInput): CancelResult {
        const marketReject = this.validateMarket(input.market);
        if (marketReject) {
            return {
                accepted: false,
                rejectReason: marketReject,
                cancelled: false,
                deltas: []
            };
        }

        const seqReject = this.bumpSeq(input.seq);
        if (seqReject) {
            return {
                accepted: false,
                rejectReason: seqReject,
                cancelled: false,
                deltas: []
            };
        }

        const restingOrder = this.ordersById.get(input.orderId);
        if (!restingOrder) {
            return {
                accepted: true,
                cancelled: false,
                deltas: []
            };
        }

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
            accepted: true,
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
    private validateMarket(market: MarketId): RejectReason | null {
        if (market !== this.market) return "MARKET_MISMATCH";
        return null;
    }

    private bumpSeq(nextSeq: Seq): RejectReason | null {
        if (nextSeq <= this.lastSeq) return "SEQ_OUT_OF_ORDER";
        this.lastSeq = nextSeq;
        return null;
    }

    private validateLimit(price: Price, qty: Qty): RejectReason | null {
        if (price <= 0n) return "INVALID_PRICE";
        if (qty <= 0n) return "INVALID_QTY";
        return null;
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
