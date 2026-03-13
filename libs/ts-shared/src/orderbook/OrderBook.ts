import { BookDelta, CancelInput, CancelResult, MarketId, OrderId, PlaceLimitInput, PlaceLimitResult, PlaceMarketInput, PlaceMarketResult, Price, Qty, RejectReason, RestingOrder, Seq, Side, Trade } from "./types";
import { insertPriceIntoLadder } from "./priceLadder";
import { PriceLevel, prunePriceLevel, removeOrderFromPriceLevel } from "./priceLevelQueue";
import { matchIncomingBuyOrder, matchIncomingSellOrder, createCancelDelta, matchMarketSellOrder, matchMarketBuyOrder } from "./matching";

export class OrderBook {
    private bids = new Map<Price, PriceLevel>();
    private asks = new Map<Price, PriceLevel>();

    private bidPricesDesc: Price[] = []; //desc
    private askPricesAsc: Price[] = [];  //asc

    private ordersById = new Map<OrderId, RestingOrder>();
    private seenOrderIds = new Set<OrderId>();

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

        if (this.seenOrderIds.has(input.orderId)) {
            return {
                accepted: false,
                rejectReason: "DUPLICATE_ORDER_ID",
                trades: [],
                deltas: [],
                remainingQty: input.qty
            };
        }

        this.seenOrderIds.add(input.orderId);

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

    placeMarket(input: PlaceMarketInput): PlaceMarketResult {
        const marketReject = this.validateMarket(input.market);
        if (marketReject) {
            return {
                accepted: false,
                rejectReason: marketReject,
                trades: [],
                deltas: [],
                filledQty: 0n,
                remainingQty: input.qty
            };
        }

        if (input.qty <= 0n) {
            return {
                accepted: false,
                rejectReason: "INVALID_QTY",
                trades: [],
                deltas: [],
                filledQty: 0n,
                remainingQty: input.qty
            };
        }

        if (this.seenOrderIds.has(input.orderId)) {
            return {
                accepted: false,
                rejectReason: "DUPLICATE_ORDER_ID",
                trades: [],
                deltas: [],
                filledQty: 0n,
                remainingQty: input.qty
            };
        }

        this.seenOrderIds.add(input.orderId);

        const trades: Trade[] = [];
        const deltas: BookDelta[] = [];
        let remainingQty = input.qty;

        if (input.side === "BUY") {
            remainingQty = matchMarketBuyOrder({
                input, startingRemainingQty: remainingQty,
                asksByPrice: this.asks, askPricesAsc: this.askPricesAsc,
                ordersById: this.ordersById, trades, deltas,
            });
        } else {
            remainingQty = matchMarketSellOrder({
                input, startingRemainingQty: remainingQty,
                bidsByPrice: this.bids, bidPricesDesc: this.bidPricesDesc,
                ordersById: this.ordersById, trades, deltas,
            });
        }

        deltas.push({
            type: "MARKET_ORDER_SETTLED",
            market: input.market,
            orderId: input.orderId,
            seq: input.seq
        });

        return {
            accepted: true,
            trades,
            deltas,
            filledQty: input.qty - remainingQty,
            remainingQty
        };
    }

    cancel(input: CancelInput): CancelResult {

        console.log("[orderbook cancel]", {
            orderId: input.orderId,
            hasOrder: this.ordersById.has(input.orderId),
        });

        const marketReject = this.validateMarket(input.market);
        if (marketReject) {
            return {
                accepted: false,
                rejectReason: marketReject,
                cancelled: false,
                deltas: []
            };
        }

        const restingOrder = this.ordersById.get(input.orderId);
        if (!restingOrder) {
            return {
                accepted: false,
                rejectReason: "UNKNOWN_ORDER_ID" as const,
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
                side: restingOrder.side,
                price: restingOrder.price,
                qty: restingOrder.qtyRemaining,
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

    getDepth(levels: number): {
        bids: Array<{ price: bigint; qty: bigint }>;
        asks: Array<{ price: bigint; qty: bigint }>;
    } {
        const aggregate = (
            pricesOrdered: Price[],
            levelMap: Map<Price, PriceLevel>
        ): Array<{ price: bigint; qty: bigint }> => {
            const result: Array<{ price: bigint; qty: bigint }> = [];
            const limit = Math.min(levels, pricesOrdered.length);
            for (let i = 0; i < limit; i++) {
                const price = pricesOrdered[i]!;
                const level = levelMap.get(price);
                if (!level) continue;
                let totalQty = 0n;
                for (let j = level.headIndex; j < level.queue.length; j++) {
                    totalQty += level.queue[j]!.qtyRemaining;
                }
                if (totalQty > 0n) result.push({ price, qty: totalQty });
            }
            return result;
        };
        return {
            bids: aggregate(this.bidPricesDesc, this.bids),
            asks: aggregate(this.askPricesAsc, this.asks),
        };
    }

    //infra helpers
    private validateMarket(market: MarketId): RejectReason | null {
        if (market !== this.market) return "MARKET_MISMATCH";
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

    public seedRestingOrder(order: {
        orderId: OrderId;
        side: Side;
        price: Price;
        qtyRemaining: Qty;
        seq: Seq;
    }): void {
        if (this.seenOrderIds.has(order.orderId)) return;
        this.seenOrderIds.add(order.orderId);

        const restingOrder: RestingOrder = {
            orderId: order.orderId,
            side: order.side,
            price: order.price,
            qtyRemaining: order.qtyRemaining,
            seq: order.seq
        };

        this.ordersById.set(order.orderId, restingOrder);

        if (order.side === "BUY") {
            const level = this.getOrCreateLevel(this.bids, order.price);
            level.queue.push(restingOrder);
            insertPriceIntoLadder(this.bidPricesDesc, order.price, "DESC");
        } else {
            const level = this.getOrCreateLevel(this.asks, order.price);
            level.queue.push(restingOrder);
            insertPriceIntoLadder(this.askPricesAsc, order.price, "ASC");
        }
    }
}
