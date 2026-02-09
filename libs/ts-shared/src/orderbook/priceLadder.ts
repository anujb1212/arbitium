import { Price } from "./types";

export type LadderSort = "ASC" | "DESC"

export function ladderHasPrice(priceLadder: Price[], price: Price): boolean {
    for (let i = 0; i < priceLadder.length; i++) {
        if (priceLadder[i] === price) return true
    }
    return false
}

export function insertPriceIntoLadder(priceLadder: Price[], price: Price, sort: LadderSort): void {
    if (ladderHasPrice(priceLadder, price)) return

    if (sort === "ASC") {
        for (let i = 0; i < priceLadder.length; i++) {
            if (price < priceLadder[i]) {
                priceLadder.splice(i, 0, price)
                return
            }
        }
        priceLadder.push(price)
        return
    }

    for (let i = 0; i < priceLadder.length; i++) {
        if (price > priceLadder[i]) {
            priceLadder.splice(i, 0, price)
            return
        }
    }

    priceLadder.push(price)
}

export function removePriceFromLadder(priceLadder: Price[], price: Price): void {
    for (let i = 0; i < priceLadder.length; i++) {
        if (priceLadder[i] === price) {
            priceLadder.splice(i, 1)
            return
        }
    }
}
