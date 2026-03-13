import React, { useEffect, useState } from "react"
import type { MarketConfig } from "../types/market"
import { fetchOrderHistory, type OrderHistoryDTO } from "../lib/apiClient"
import { formatPrice, formatQty, truncateId } from "../lib/format"

type Props = {
    market: string
    config: MarketConfig
}

export function OrderHistory({ market, config }: Props): React.JSX.Element {
    const [orders, setOrders] = useState<OrderHistoryDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setLoading(true)
        setError(null)
        fetchOrderHistory(market)
            .then(setOrders)
            .catch((err) => setError((err as Error).message))
            .finally(() => setLoading(false))
    }, [market])

    if (loading) return <div className="flex items-center justify-center h-full text-[12px] text-lo">
        Loading...
    </div>
    if (error) return <div className="flex items-center justify-center h-full text-[12px] text-lo">
        No Order History
    </div>
    if (orders.length === 0) return <div className="flex items-center justify-center h-full text-[12px] text-lo">
        No orders yet
    </div>

    return (
        <table className="w-full min-w-[680px] text-[12px]">
            <thead className="sticky top-0 bg-panel border-b border-line z-10">
                <tr>
                    {["Order ID", "Side", "Price", "Qty", "Filled", "Status", "Time"].map((header, i) => (
                        <th
                            key={header}
                            className={`px-4 py-2 text-[11px] font-medium text-lo
                                ${i < 2 ? "text-left" : "text-right"}`}
                        >
                            {header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {orders.map((order) => {
                    const statusColor = order.status === "FILLED" ? "text-bull"
                        : order.status === "CANCELLED" ? "text-bear"
                            : "text-mid"
                    return (
                        <tr key={order.orderId} className="border-b border-line/40 hover:bg-raised/50">
                            <td className="px-4 py-2 font-mono text-mid">{truncateId(order.orderId)}</td>
                            <td className={`px-4 py-2 font-semibold
                                ${order.side === "BUY" ? "text-bull" : "text-bear"}`}>
                                {order.side}
                            </td>
                            <td className="px-4 py-2 font-mono text-hi text-right">
                                {formatPrice(order.price, config.priceScale)}
                            </td>
                            <td className="px-4 py-2 font-mono text-hi text-right">
                                {formatQty(order.qty, config.qtyScale)}
                            </td>
                            <td className="px-4 py-2 font-mono text-mid text-right">
                                {formatQty(order.filledQty, config.qtyScale)}
                            </td>
                            <td className="px-4 py-2 text-right">
                                <span className={`text-[11px] font-medium ${statusColor}`}>
                                    {order.status}
                                </span>
                            </td>
                            <td className="px-4 py-2 font-mono text-lo text-right text-[11px]">
                                {new Date(order.createdAtMs).toLocaleDateString()}
                            </td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
    )
}
