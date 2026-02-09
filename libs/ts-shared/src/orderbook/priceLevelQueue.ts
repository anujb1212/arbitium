import { removePriceFromLadder } from "./priceLadder";
import { OrderId, Price, RestingOrder } from "./types";

export interface PriceLevel {
    queue: RestingOrder[];
    headIndex: number
}

export function peekFrontOrder(priceLevel: PriceLevel): RestingOrder | null {
    advanceHeadPastFilled(priceLevel)
    return priceLevel.headIndex < priceLevel.queue.length
        ? priceLevel.queue[priceLevel.headIndex]!
        : null
}

export function advanceHeadPastFilled(priceLevel: PriceLevel): void {
    while (priceLevel.headIndex < priceLevel.queue.length) {
        const frontOrder = priceLevel.queue[priceLevel.headIndex]!
        if (frontOrder.qtyRemaining > 0n) return
        priceLevel.headIndex++
    }
}

export function compactPriceLevel(priceLevel: PriceLevel): void {
    if (priceLevel.headIndex < 64) return

    if (priceLevel.headIndex * 2 < priceLevel.queue.length) return

    priceLevel.queue.splice(0, priceLevel.headIndex)
    priceLevel.headIndex = 0
}

export function prunePriceLevel(params: {
    levelByPrice: Map<Price, PriceLevel>;
    priceLadder: Price[];
    price: Price
}): void {
    const { levelByPrice, priceLadder, price } = params

    const priceLevel = levelByPrice.get(price)
    if (!priceLevel) {
        removePriceFromLadder(priceLadder, price)
        return
    }

    advanceHeadPastFilled(priceLevel)
    compactPriceLevel(priceLevel)

    if (priceLevel.headIndex >= priceLevel.queue.length) {
        levelByPrice.delete(price)
        removePriceFromLadder(priceLadder, price)
    }
}

export function removeOrderFromPriceLevel(priceLevel: PriceLevel, orderId: OrderId): boolean {
    for (let i = priceLevel.headIndex; i < priceLevel.queue.length; i++) {
        if (priceLevel.queue[i]!.orderId === orderId) {
            priceLevel.queue.splice(i, 1)
            return true
        }
    }
    return false
}
