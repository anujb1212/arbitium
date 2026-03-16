import React, { useState } from "react"
import type { MarketConfig } from "../types/market"
import type { OpenOrder } from "../hooks/useOpenOrders"
import { cancelOrder } from "../lib/apiClient"
import { formatPrice, formatQty, truncateId } from "../lib/format"
import { useToast } from "./ToastProvider"

type Props = {
    config: MarketConfig
    openOrders: OpenOrder[]
}

export function OpenOrders({ config, openOrders }: Props): React.JSX.Element {
    const [cancelingIds, setCancelingIds] = useState<Set<string>>(() => new Set())
    const { addToast } = useToast()

    async function handleCancel(orderId: string): Promise<void> {
        if (cancelingIds.has(orderId)) return
        setCancelingIds((prev) => new Set(prev).add(orderId))
        try {
            await cancelOrder({ orderId, market: config.market })
            addToast('info', 'Cancel Requested', `Order ${truncateId(orderId)} cancel request sent.`)
        } catch (err) {
            addToast('error', 'Cancel Failed', (err as Error).message)
        } finally {
            setCancelingIds((prev) => {
                const next = new Set(prev)
                next.delete(orderId)
                return next
            })
        }
    }

    if (openOrders.length === 0)
        return <div className="flex items-center justify-center h-full text-[13px] font-medium text-lo">
            No active orders
        </div>

    return (
        <div className="w-full h-full overflow-x-auto overflow-y-auto scrollbar-thin">
            <table className="w-full min-w-[720px] text-left border-collapse">
                <thead className="sticky top-0 bg-panel z-10 after:absolute after:inset-x-0 after:bottom-0 after:border-b after:border-line">
                    <tr>
                        {["Order ID", "Side", "Price", "Qty", "Remaining", "Status", ""].map((header, i) => (
                            <th
                                key={header}
                                className={`px-5 py-3 text-[11px] font-medium text-lo uppercase tracking-wider
                                    ${(i >= 2 && i <= 4) || i === 6 ? "text-right" : ""}`}
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-line/40">
                    {openOrders.map((order) => {
                        const canceling = cancelingIds.has(order.orderId)
                        const canCancel = order.status === "OPEN" && !canceling
                        return (
                            <tr key={order.orderId} className="hover:bg-raised/40 transition-colors group">
                                <td className="px-5 py-2.5 font-mono text-[12px] text-mid group-hover:text-hi transition-colors">
                                    {truncateId(order.orderId)}
                                </td>
                                <td className={`px-5 py-2.5 text-[12px] font-bold
                                    ${order.side === "BUY" ? "text-bull" : "text-bear"}`}>
                                    {order.side}
                                </td>
                                <td className="px-5 py-2.5 font-mono tabular-nums text-[12px] text-hi text-right font-medium">
                                    {formatPrice(order.price, config.priceScale)}
                                </td>
                                <td className="px-5 py-2.5 font-mono tabular-nums text-[12px] text-hi text-right">
                                    {formatQty(order.originalQty, config.qtyScale)}
                                </td>
                                <td className="px-5 py-2.5 font-mono tabular-nums text-[12px] text-mid text-right">
                                    {formatQty(order.remainingQty, config.qtyScale)}
                                </td>
                                <td className="px-5 py-2.5">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm
                                        ${order.status === "OPEN" ? "bg-bull/10 text-bull" : "bg-line text-mid"}`}>
                                        {order.status === "OPEN" ? "Open" : "Pending"}
                                    </span>
                                </td>
                                <td className="px-5 py-2.5 text-right">
                                    <button
                                        type="button"
                                        onClick={() => handleCancel(order.orderId)}
                                        disabled={!canCancel}
                                        className="px-3 py-1 rounded bg-base border border-line text-hi
                                            text-[11px] font-semibold hover:border-bear/50 hover:text-bear hover:bg-bear/10
                                            active:scale-[0.96] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    >
                                        {canceling ? "Canceling..." : canCancel ? "Cancel" : "-"}
                                    </button>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
