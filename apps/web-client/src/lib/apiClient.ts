const API_URL: string = import.meta.env.VITE_API_URL;
if (!API_URL) {
    throw new Error("[apiClient] VITE_API_URL undefined. Check .env.development and restart Vite.");
}

export type KlineBar = {
    openTime: number; closeTime: number;
    open: string; high: string; low: string; close: string;
    volume: string; tradeCount: number;
};

export type DepthSnapshot = {
    bids: Array<{ price: string; qty: string }>;
    asks: Array<{ price: string; qty: string }>;
};

export type TickerSnapshot = {
    market: string;
    lastPrice: string; open24h: string;
    high24h: string; low24h: string;
    volume24h: string; tradeCount24h: number;
    priceChange24h: string; priceChangePct24h: string;
};

export type RecentTrade = {
    id: string;
    price: string;
    qty: string;
    takerSide: "BUY" | "SELL";
    executedAt: number;
};

export type OpenOrderDTO = {
    orderId: string
    commandId: string
    side: "BUY" | "SELL"
    price: string
    qty: string
    filledQty: string
    status: "PENDING" | "OPEN" | "PARTIALLY_FILLED"
    createdAtMs: number
}

export type FillDTO = {
    id: string
    market: string
    side: "BUY" | "SELL"
    price: string
    qty: string
    role: "MAKER" | "TAKER"
    executedAt: number
}

export type OrderHistoryDTO = {
    orderId: string
    market: string
    side: "BUY" | "SELL"
    price: string
    qty: string
    filledQty: string
    status: "OPEN" | "PARTIALLY_FILLED" | "FILLED" | "CANCELLED"
    createdAt: number
}

export async function fetchOpenOrders(market: string): Promise<OpenOrderDTO[]> {
    const res = await fetch(`${API_URL}/orders?market=${encodeURIComponent(market)}`, {
        headers: getAuthHeaders(),
    })
    const data = await res.json() as { orders: OpenOrderDTO[] }
    return data.orders
}

export async function fetchDepth(market: string): Promise<DepthSnapshot> {
    const res = await fetch(`${API_URL}/market/depth?market=${encodeURIComponent(market)}`);
    return handleResponse<DepthSnapshot>(res);
}

export async function fetchKlines(params: {
    market: string;
    interval: string;
    from: number;
    to: number;
}): Promise<KlineBar[]> {
    const qs = new URLSearchParams({
        market: params.market,
        interval: params.interval,
        from: String(params.from),
        to: String(params.to),
    });
    const res = await fetch(`${API_URL}/market/klines?${qs}`);
    return handleResponse<KlineBar[]>(res);
}

export async function fetchRecentTrades(market: string): Promise<RecentTrade[]> {
    const res = await fetch(`${API_URL}/market/trades?market=${encodeURIComponent(market)}`);
    return handleResponse<RecentTrade[]>(res);
}

export async function fetchTicker(market: string): Promise<TickerSnapshot> {
    const res = await fetch(`${API_URL}/market/ticker?market=${encodeURIComponent(market)}`);
    return handleResponse<TickerSnapshot>(res);
}

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("arbitium_token");
    return token
        ? { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
        : { "Content-Type": "application/json" };
}

async function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
    return res.json() as Promise<T>;
}

export async function placeLimitOrder(params: {
    market: string;
    orderId: string;
    side: "BUY" | "SELL";
    price: string;
    qty: string;
}): Promise<{ commandId: string }> {
    const res = await fetch(`${API_URL}/orders/limit`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(params),
    });
    return handleResponse<{ commandId: string }>(res);
}

export async function cancelOrder(params: {
    orderId: string;
    market: string;
}): Promise<{ commandId: string }> {
    const res = await fetch(`${API_URL}/orders/${params.orderId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        body: JSON.stringify({ market: params.market }),
    });
    return handleResponse<{ commandId: string }>(res);
}

export async function depositFunds(params: {
    amountInPaise: string;
    idempotencyKey: string;
}): Promise<{ transferId: string; status: string }> {
    const res = await fetch(`${API_URL}/transfers/deposit`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(params),
    });
    return handleResponse<{ transferId: string; status: string }>(res);
}

export async function withdrawFunds(params: {
    amountInPaise: string;
    idempotencyKey: string;
}): Promise<{ transferId: string; status: string }> {
    const res = await fetch(`${API_URL}/transfers/withdraw`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(params),
    });
    return handleResponse<{ transferId: string; status: string }>(res);
}

export async function fetchTradingBalance(): Promise<{
    available: string;
    locked: string;
    welcomeBonusGranted?: boolean
}> {
    const res = await fetch(`${API_URL}/transfers/balance`, {
        headers: getAuthHeaders(),
    });
    return handleResponse<{ available: string; locked: string }>(res);
}

export async function fetchFillHistory(market: string): Promise<FillDTO[]> {
    const res = await fetch(`${API_URL}/orders/fills?market=${encodeURIComponent(market)}`, {
        headers: getAuthHeaders(),
    })
    return handleResponse<FillDTO[]>(res)
}

export async function fetchOrderHistory(market: string): Promise<OrderHistoryDTO[]> {
    const res = await fetch(`${API_URL}/orders/history?market=${encodeURIComponent(market)}`, {
        headers: getAuthHeaders(),
    })
    return handleResponse<OrderHistoryDTO[]>(res)
}

export async function placeMarketOrder(params: {
    market: string
    orderId: string
    side: "BUY" | "SELL"
    qty: string
}): Promise<{ commandId: string }> {
    const res = await fetch(`${API_URL}/orders/market`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(params),
    })
    return handleResponse<{ commandId: string }>(res)
}
