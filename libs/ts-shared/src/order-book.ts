import { randomUUID } from "crypto"
import { Decimal, configureDecimal } from "./decimal-config"
import { Order, Trade, Side } from './types'

configureDecimal()

export class OrderBook {
    private bids: Map<string, Order[]> = new Map()
    private asks: Map<string, Order[]> = new Map()
    private tradeIdCounter: number = 0
    private readonly market: string

    constructor(market: string) {
        this.market = market
    }

    placeLimitOrder(
        side: Side,
        price: string,
        size: string,
        userId: string
    ): {
        trades: Trade[];
        orderId: string;
        remainingSize: string
    } {
        const priceDecimal = new Decimal(price)
        const sizeDecimal = new Decimal(size)

        if (priceDecimal.lte(0) || sizeDecimal.lte(0)) {
            throw new Error('Price and size must be positive')
        }

        const order: Order = {
            id: randomUUID(),
            side,
            price,
            size,
            timestamp: Date.now(),
            userId,
            filled: '0'
        }

        const trades = this.matchOrder(order)

        const filledDecimal = new Decimal(order.filled)
        const remaining = sizeDecimal.minus(filledDecimal)

        if (!remaining.isZero()) {
            this.addToBook(order, remaining.toString())
        }

        return {
            trades,
            orderId: order.id,
            remainingSize: remaining.toString()
        }
    }

    private matchOrder(order: Order): Trade[] {
        const trades: Trade[] = []
        const book = order.side === 'buy' ? this.asks : this.bids

        const sortedPrice = Array.from(book.keys()).sort((a, b) => {
            const diff = new Decimal(a).minus(b)
            const comparison = order.side === 'buy' ? diff : diff.neg()
            return comparison.toNumber()
        })

        let remainingSize = new Decimal(order.side)
        const orderPrice = new Decimal(order.price)

        for (const priceLevel of sortedPrice) {
            if (remainingSize.isZero()) break

            const priceLevelDecimal = new Decimal(priceLevel)

            const canMatch = order.side === 'buy'
                ? orderPrice.gte(priceLevelDecimal)
                : orderPrice.lte(priceLevelDecimal)

            if (!canMatch) break

            const orders = book.get(priceLevel)
            if (!orders || orders.length === 0) continue

            let i = 0
            while (i < orders.length && !remainingSize.isZero()) {
                const bookOrder = orders[i]

                if (bookOrder.userId === order.userId) {
                    i++
                    continue
                }

                const bookOrderFilled = new Decimal(bookOrder.filled)
                const bookOrderSize = new Decimal(bookOrder.size)
                const bookOrderRemaining = bookOrderSize.minus(bookOrder.filled)

                const matchSize = Decimal.min(remainingSize, bookOrderRemaining)

                trades.push({
                    buyOrderId: order.side === 'buy' ? order.id : bookOrder.id,
                    sellOrderId: order.side === 'sell' ? order.id : bookOrder.id,
                    price: priceLevel,
                    size: matchSize.toString(),
                    timestamp: Date.now(),
                    tradeId: `${this.market}_${this.tradeIdCounter++}`
                })

                remainingSize = remainingSize.minus(matchSize)
                bookOrder.filled = bookOrderFilled.plus(matchSize).toString()

                if (bookOrder.filled === bookOrder.size) {
                    orders.splice(i, 1)
                } else {
                    i++
                }
            }

            if (orders.length === 0) {
                book.delete(priceLevel)
            }
        }

        const orderSizeDecimal = new Decimal(order.size)
        order.filled = orderSizeDecimal.minus(remainingSize).toString()

        return trades
    }

    private addToBook(order: Order, remainingSize: string): void {
        const book = order.side === 'buy' ? this.bids : this.asks;

        const newOrder: Order = {
            ...order,
            size: remainingSize,
            filled: '0'
        };

        if (!book.has(order.price)) {
            book.set(order.price, []);
        }

        book.get(order.price)!.push(newOrder);
    }

    cancelOrder(orderId: string, userId: string): {
        success: boolean;
        cancelledSize?: string
    } {
        //Check for bids
        for (const [price, orders] of this.bids.entries()) {
            const index = orders.findIndex(order => order.id === orderId)

            if (index !== -1) {
                const order = orders[index]

                if (order.userId !== userId) {
                    throw new Error('Unauthorized: Cannot cancel another person\'s order')
                }

                const filled = new Decimal(order.filled)
                const size = new Decimal(order.size)
                const cancelled = size.sub(filled)

                orders.splice(index, 1)
                if (orders.length === 0) {
                    this.bids.delete(price)
                }

                return {
                    success: true,
                    cancelledSize: cancelled.toString()
                }
            }
        }

        //Check for asks
        for (const [price, orders] of this.asks.entries()) {
            const index = orders.findIndex(order => order.id === orderId)

            if (index !== -1) {
                const order = orders[index]

                if (order.userId !== userId) {
                    throw new Error('Unauthorized')
                }

                const filled = new Decimal(order.filled)
                const size = new Decimal(order.size)
                const cancelled = size.sub(filled)

                orders.splice(index, 1)
                if (orders.length === 0) {
                    this.bids.delete(price)
                }

                return {
                    success: true,
                    cancelledSize: cancelled.toString()
                }
            }
        }

        return {
            success: false
        }
    }

    getDepth(): {
        bids: [string, string][];
        asks: [string, string][]
    } {
        const bids: [string, string][] = []
        const asks: [string, string][] = []

        //Aggregate bids
        for (const [price, orders] of this.bids.entries()) {

            let total = new Decimal('0')
            for (const order of orders) {
                const filled = new Decimal(order.filled)
                const size = new Decimal(order.size)
                const remaining = size.sub(filled)
                total = total.add(remaining)
            }

            if (!total.isZero()) {
                bids.push([price, total.toString()])
            }
        }

        //Aggregate asks
        for (const [price, orders] of this.asks.entries()) {

            let total = new Decimal('0')
            for (const order of orders) {
                const filled = new Decimal(order.filled)
                const size = new Decimal(order.size)
                const remaining = size.sub(filled)
                total = total.add(remaining)
            }

            if (!total.isZero()) {
                asks.push([price, total.toString()])
            }
        }

        bids.sort((a, b) => new Decimal(b[0]).valueOf > new Decimal(a[0]).valueOf ? 1 : -1)
        asks.sort((a, b) => new Decimal(b[0]).valueOf > new Decimal(a[0]).valueOf ? 1 : -1)

        return {
            bids,
            asks
        }
    }

    getBestBid(): string | null {
        if (this.bids.size === 0) return null

        const prices = Array.from(this.bids.keys())
        return prices.reduce((max, price) =>
            new Decimal(price).valueOf < new Decimal(max).valueOf ? price : max
        )
    }

    getBestAsk(): string | null {
        if (this.asks.size === 0) return null

        const prices = Array.from(this.asks.keys())
        return prices.reduce((min, price) =>
            new Decimal(price).valueOf < new Decimal(min).valueOf ? price : min
        )
    }
}
