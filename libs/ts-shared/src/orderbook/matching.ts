import { peekFrontOrder, PriceLevel, prunePriceLevel } from "./priceLevelQueue";
import { BookDelta, MarketId, OrderId, PlaceLimitInput, Price, Qty, Trade } from "./types";

export function matchIncomingBuyOrder(params: {
    input: PlaceLimitInput;
    startingRemainingQty: Qty;
    asksByPrice: Map<Price, PriceLevel>;
    askPricesAsc: Price[];
    ordersById: Map<OrderId, { qtyRemaining: Qty }>;
    trades: Trade[];
    deltas: BookDelta[]
}) {
    const { input, asksByPrice, askPricesAsc, ordersById, trades, deltas } = params

    let remainingQty = params.startingRemainingQty

    while (remainingQty > 0n) {
        const bestAskPrice = askPricesAsc[0] ?? null
        if (bestAskPrice === null) break
        if (bestAskPrice > input.price) break

        const askLevel = asksByPrice.get(bestAskPrice)
        if (!askLevel) {
            prunePriceLevel({
                levelByPrice: asksByPrice,
                priceLadder: askPricesAsc,
                price: bestAskPrice
            })
            continue
        }

        const makerOrder = peekFrontOrder(askLevel)
        if (!makerOrder) {
            prunePriceLevel({
                levelByPrice: asksByPrice,
                priceLadder: askPricesAsc,
                price: bestAskPrice
            })
            continue
        }

        const fillQty = makerOrder.qtyRemaining < remainingQty
            ? makerOrder.qtyRemaining
            : remainingQty

        makerOrder.qtyRemaining -= fillQty  //order maker
        remainingQty -= fillQty             //order taker

        trades.push({
            market: input.market,
            takerOrderId: input.orderId,
            makerOrderId: makerOrder.orderId,
            price: makerOrder.price,
            qty: fillQty,
            takerSide: "BUY",
            seq: input.seq
        })

        deltas.push({
            type: "FILL",
            market: input.market,
            makerOrderId: makerOrder.orderId,
            takerOrderId: input.orderId,
            price: makerOrder.price,
            qty: fillQty,
            seq: input.seq
        })

        if (makerOrder.qtyRemaining === 0n) {
            ordersById.delete(makerOrder.orderId)
        }

        prunePriceLevel({
            levelByPrice: asksByPrice,
            priceLadder: askPricesAsc,
            price: bestAskPrice
        })
    }

    return remainingQty
}

export function matchIncomingSellOrder(params: {
    input: PlaceLimitInput;
    startingRemainingQty: Qty;
    bidsByPrice: Map<Price, PriceLevel>;
    bidPricesDesc: Price[];
    ordersById: Map<OrderId, { qtyRemaining: Qty }>;
    trades: Trade[];
    deltas: BookDelta[]
}) {
    const { input, bidsByPrice, bidPricesDesc, ordersById, trades, deltas } = params

    let remainingQty = params.startingRemainingQty

    while (remainingQty > 0n) {
        const bestBidPrice = bidPricesDesc[0] ?? null
        if (bestBidPrice === null) break
        if (bestBidPrice < input.price) break

        const bidLevel = bidsByPrice.get(bestBidPrice)
        if (!bidLevel) {
            prunePriceLevel({
                levelByPrice: bidsByPrice,
                priceLadder: bidPricesDesc,
                price: bestBidPrice
            })
            continue
        }

        const makerOrder = peekFrontOrder(bidLevel)
        if (!makerOrder) {
            prunePriceLevel({
                levelByPrice: bidsByPrice,
                priceLadder: bidPricesDesc,
                price: bestBidPrice
            })
            continue
        }

        const fillQty = makerOrder.qtyRemaining < remainingQty
            ? makerOrder.qtyRemaining
            : remainingQty

        makerOrder.qtyRemaining -= fillQty  //order maker
        remainingQty -= fillQty             //order taker

        trades.push({
            market: input.market,
            takerOrderId: input.orderId,
            makerOrderId: makerOrder.orderId,
            price: makerOrder.price,
            qty: fillQty,
            takerSide: "SELL",
            seq: input.seq
        })

        deltas.push({
            type: "FILL",
            market: input.market,
            makerOrderId: makerOrder.orderId,
            takerOrderId: input.orderId,
            price: makerOrder.price,
            qty: fillQty,
            seq: input.seq
        })

        if (makerOrder.qtyRemaining === 0n) {
            ordersById.delete(makerOrder.orderId)
        }

        prunePriceLevel({
            levelByPrice: bidsByPrice,
            priceLadder: bidPricesDesc,
            price: bestBidPrice
        })
    }

    return remainingQty
}

export function createCancelDelta(params: {
    market: MarketId;
    orderId: OrderId;
    seq: bigint
}): BookDelta {
    const { market, orderId, seq } = params

    return {
        type: "CANCEL",
        market: market,
        orderId: orderId,
        seq: seq
    }
}
