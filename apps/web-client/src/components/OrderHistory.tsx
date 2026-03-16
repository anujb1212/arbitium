import React, { useEffect, useState } from "react"
import type { MarketConfig } from "../types/market"
import { fetchOrderHistory, type OrderHistoryDTO } from "../lib/apiClient"
import { formatPrice, formatQty, truncateId } from "../lib/format"

type Props = { market: string; config: MarketConfig }

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

    if (loading) return <div className="flex items-center justify-center h-full text-[13px] font-medium text-lo">Loading data...</div>
    if (error) return <div className="flex items-center justify-center h-full text-[13px] font-medium text-bear">Failed to load history</div>
    if (orders.length === 0) return <div className="flex items-center justify-center h-full text-[13px] font-medium text-lo">No historical orders</div>

    return (
        <div className="w-full h-full overflow-x-auto overflow-y-auto scrollbar-thin">
            <table className="w-full min-w-[720px] text-left border-collapse">
                <thead className="sticky top-0 bg-panel z-10 after:absolute after:inset-x-0 after:bottom-0 after:border-b after:border-line">
                    <tr>
                        {["Order ID", "Side", "Price", "Qty", "Filled", "Status", "Time"].map((header, i) => (
                            <th
                                key={header}
                                className={`px-5 py-3 text-[11px] font-medium text-lo uppercase tracking-wider
                                    ${i >= 2 ? "text-right" : ""}`}
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-line/40">
                    {orders.map((order) => {
                        const isFilled = order.status === "FILLED";
                        const isCanceled = order.status === "CANCELLED";
                        return (
                            <tr key={order.orderId} className="hover:bg-raised/40 transition-colors group">
                                <td className="px-5 py-2.5 font-mono text-[12px] text-mid group-hover:text-hi transition-colors">
                                    {truncateId(order.orderId)}
                                </td>
                                <td className={`px-5 py-2.5 text-[12px] font-bold ${order.side === "BUY" ? "text-bull" : "text-bear"}`}>
                                    {order.side}
                                </td>
                                <td className="px-5 py-2.5 font-mono tabular-nums text-[12px] text-hi text-right font-medium">
                                    {formatPrice(order.price, config.priceScale)}
                                </td>
                                <td className="px-5 py-2.5 font-mono tabular-nums text-[12px] text-hi text-right">
                                    {formatQty(order.qty, config.qtyScale)}
                                </td>
                                <td className="px-5 py-2.5 font-mono tabular-nums text-[12px] text-mid text-right">
                                    {formatQty(order.filledQty, config.qtyScale)}
                                </td>
                                <td className="px-5 py-2.5 text-right">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm
                                        ${isFilled ? "bg-bull/10 text-bull" : isCanceled ? "bg-bear/10 text-bear" : "bg-line text-mid"}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-5 py-2.5 font-mono tabular-nums text-lo text-right text-[12px]">
                                    {new Date(order.createdAtMs).toLocaleDateString()}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
