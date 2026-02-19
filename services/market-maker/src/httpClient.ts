import { API_URL } from "./config";

type PlaceLimitParams = {
    market: string;
    orderId: string;
    side: "BUY" | "SELL";
    price: bigint;
    qty: bigint
}

export async function placeLimitOrder(params: PlaceLimitParams): Promise<void> {
    const response = await fetch(`${API_URL}/orders/limit`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            market: params.market,
            orderId: params.orderId,
            side: params.side,
            price: params.price.toString(10),
            qty: params.qty.toString(10)
        })
    })

    if (!response.ok) {
        throw new Error(`placeLimitOrder failed: ${response.status} ${await response.text()}`)
    }
}

export async function cancelOrder(params: {
    market: string,
    orderId: string
}): Promise<void> {
    const response = await fetch(`${API_URL}/orders/${params.orderId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            market: params.market
        })
    })

    // 404 = already matched/cancelled
    if (!response.ok && response.status !== 404) {
        throw new Error(`cancelOrder failed: ${response.status} ${await response.text()}`)
    }
}