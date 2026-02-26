const API_URL: string = import.meta.env.VITE_API_URL;
if (!API_URL) {
    throw new Error("[apiClient] VITE_API_URL undefined. Check .env.development and restart Vite.");
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
