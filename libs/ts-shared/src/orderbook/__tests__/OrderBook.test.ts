import { describe, it, expect } from "vitest"
import { OrderBook } from "../OrderBook"

describe("Resting", () => {
    it("", () => {

    })

})

describe("OrderBook matching", () => {
    it("FIFO within same price (partial fill)", () => {
        const ob = new OrderBook("TATA_INR");

        ob.placeLimit({
            market: "TATA_INR",
            orderId: "S1",
            side: "SELL",
            price: 100n,
            qty: 5n,
            seq: 1n
        })

        ob.placeLimit({
            market: "TATA_INR",
            orderId: "S2",
            side: "SELL",
            price: 100n,
            qty: 7n,
            seq: 2n
        })

        const r = ob.placeLimit({
            market: "TATA_INR",
            orderId: "B1",
            side: "BUY",
            price: 100n,
            qty: 10n,
            seq: 3n
        })

        expect(r.trades.map(t => [t.makerOrderId, t.qty])).toEqual([["S1", 5n], ["S2", 5n]])

        expect(ob.getOrder("S1")).toBe(null)
        expect(ob.getOrder("S2")?.qtyRemaining).toBe(2n)
        expect(ob.getBestAsk()).toBe(100n)
    })

    it("Price priority beats time", () => {
        const ob = new OrderBook("TATA_INR")

        ob.placeLimit({
            market: "TATA_INR",
            orderId: "S_old",
            side: "SELL",
            price: 101n,
            qty: 5n,
            seq: 1n
        })

        ob.placeLimit({
            market: "TATA_INR",
            orderId: "S_best",
            side: "SELL",
            price: 100n,
            qty: 5n,
            seq: 2n
        })

        const r = ob.placeLimit({
            market: "TATA_INR",
            orderId: "B1",
            side: "BUY",
            price: 101n,
            qty: 5n,
            seq: 3n
        })

        expect(r.trades.length).toBe(1)
        expect(r.trades[0]?.makerOrderId).toBe("S_best")
        expect(r.trades[0]?.price).toBe(100n)
    })
})
