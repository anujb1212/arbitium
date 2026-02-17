import { OrderBook } from "../OrderBook";

export function runScenario() {
    const orderBook = new OrderBook("TATA_INR");

    // Makers (asks)
    orderBook.placeLimit({
        market: "TATA_INR",
        orderId: "S1",
        side: "SELL",
        price: 101n,
        qty: 2n,
        seq: 1n
    });

    orderBook.placeLimit({
        market: "TATA_INR",
        orderId: "S2",
        side: "SELL",
        price: 101n,
        qty: 2n,
        seq: 2n
    });

    orderBook.placeLimit({
        market: "TATA_INR",
        orderId: "S3",
        side: "SELL",
        price: 102n,
        qty: 2n,
        seq: 3n
    });

    // Taker (sweeps levels)
    const buyResult = orderBook.placeLimit({
        market: "TATA_INR",
        orderId: "B1",
        side: "BUY",
        price: 102n,
        qty: 5n,
        seq: 4n,
    });

    // Remove remaining maker qty (if any)
    const cancelResult = orderBook.cancel({
        market: "TATA_INR",
        orderId: "S3",
        seq: 5n
    });

    return {
        buyResult,
        cancelResult,
        bestBid: orderBook.getBestBid(),
        bestAsk: orderBook.getBestAsk(),
        s1: orderBook.getOrder("S1"),
        s2: orderBook.getOrder("S2"),
        s3: orderBook.getOrder("S3"),
    };
}

export function runScenarioCancelMiddle() {
    const orderBook = new OrderBook("TATA_INR");

    orderBook.placeLimit({
        market: "TATA_INR",
        orderId: "S1",
        side: "SELL",
        price: 100n,
        qty: 1n,
        seq: 1n
    });

    orderBook.placeLimit({
        market: "TATA_INR",
        orderId: "S2",
        side: "SELL",
        price: 100n,
        qty: 1n,
        seq: 2n
    });

    orderBook.placeLimit({
        market: "TATA_INR",
        orderId: "S3",
        side: "SELL",
        price: 100n,
        qty: 1n,
        seq: 3n
    });

    const cancelS2 = orderBook.cancel({
        market: "TATA_INR",
        orderId: "S2",
        seq: 4n
    });

    const buyResult = orderBook.placeLimit({
        market: "TATA_INR",
        orderId: "B1",
        side: "BUY",
        price: 100n,
        qty: 2n,
        seq: 5n,
    });

    return {
        cancelS2,
        buyResult,
        bestAsk: orderBook.getBestAsk(),
        s1: orderBook.getOrder("S1"),
        s2: orderBook.getOrder("S2"),
        s3: orderBook.getOrder("S3"),
    };
}