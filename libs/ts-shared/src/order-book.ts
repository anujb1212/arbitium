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



}

