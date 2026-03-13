import React, { useState } from "react"
import type { MarketConfig } from "../types/market"
import type { OpenOrder } from "../hooks/useOpenOrders"
import { cancelOrder } from "../lib/apiClient"
import { formatPrice, formatQty, truncateId } from "../lib/format"


type Props = {
    config: MarketConfig
    openOrders: OpenOrder[]
}

export function OpenOrders({ config, openOrders }: Props): React.JSX.Element {
    const [cancelingIds, setCancelingIds] = useState<Set<string>>(() => new Set())

    async function handleCancel(orderId: string): Promise<void> {
        if (cancelingIds.has(orderId)) return
        setCancelingIds((prev) => new Set(prev).add(orderId))
        try {
            await cancelOrder({ orderId, market: config.market })
        } catch (err) {
            alert(`Cancel failed: ${(err as Error).message}`)
        } finally {
            setCancelingIds((prev) => {
                const next = new Set(prev)
                next.delete(orderId)
                return next
            })
        }
    }

    if (openOrders.length === 0)
        return <div className="flex items-center justify-center h-full text-[12px] text-lo">
            No orders yet
        </div>

    return (
        <table className="w-full min-w-[640px] text-[12px]">
            <thead className="sticky top-0 bg-panel border-b border-line z-10">
                <tr>
                    {["Order ID", "Side", "Price", "Qty", "Remaining", "Status", "Action"].map((header, i) => (
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
                {openOrders.map((order) => {
                    const canceling = cancelingIds.has(order.orderId)
                    const canCancel = order.status === "OPEN" && !canceling
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
                                {formatQty(order.originalQty, config.qtyScale)}
                            </td>
                            <td className="px-4 py-2 font-mono text-mid text-right">
                                {formatQty(order.remainingQty, config.qtyScale)}
                            </td>
                            <td className="px-4 py-2 text-right">
                                <span className={`text-[11px] font-medium
                                    ${order.status === "OPEN" ? "text-bull" : "text-mid"}`}>
                                    {order.status === "OPEN" ? "Open" : "Submitting"}
                                </span>
                            </td>
                            <td className="px-4 py-2 text-right">
                                <button
                                    type="button"
                                    onClick={() => handleCancel(order.orderId)}
                                    disabled={!canCancel}
                                    className="px-2.5 py-1 rounded border border-bear/40 text-bear
                                        text-[11px] font-medium hover:bg-bear/10
                                        disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    {canceling ? "Canceling…" : canCancel ? "Cancel" : "—"}
                                </button>
                            </td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
    )
}
