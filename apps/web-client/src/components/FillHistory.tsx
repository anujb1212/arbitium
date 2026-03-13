import React, { useEffect, useState } from "react"
import type { MarketConfig } from "../types/market"
import { fetchFillHistory, type FillDTO } from "../lib/apiClient"
import { formatPrice, formatQty } from "../lib/format"


type Props = {
    market: string
    config: MarketConfig
}

export function FillHistory({ market, config }: Props): React.JSX.Element {
    const [fills, setFills] = useState<FillDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setLoading(true)
        setError(null)
        fetchFillHistory(market)
            .then(setFills)
            .catch((err) => setError((err as Error).message))
            .finally(() => setLoading(false))
    }, [market])

    if (loading) return <div className="flex items-center justify-center h-full text-[12px] text-lo">
        Loading...
    </div>
    if (error) return <div className="flex items-center justify-center h-full text-[12px] text-lo">
        No Order History
    </div>
    if (fills.length === 0) return <div className="flex items-center justify-center h-full text-[12px] text-lo">
        No orders yet
    </div>

    return (
        <table className="w-full min-w-[560px] text-[12px]">
            <thead className="sticky top-0 bg-panel border-b border-line z-10">
                <tr>
                    {["Side", "Price", "Qty", "Role", "Time"].map((header, i) => (
                        <th
                            key={header}
                            className={`px-4 py-2 text-[11px] font-medium text-lo
                                ${i === 0 ? "text-left" : "text-right"}`}
                        >
                            {header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {fills.map((fill) => (
                    <tr key={fill.id} className="border-b border-line/40 hover:bg-raised/50">
                        <td className={`px-4 py-2 font-semibold
                            ${fill.side === "BUY" ? "text-bull" : "text-bear"}`}>
                            {fill.side}
                        </td>
                        <td className="px-4 py-2 font-mono text-hi text-right">
                            {formatPrice(fill.price, config.priceScale)}
                        </td>
                        <td className="px-4 py-2 font-mono text-hi text-right">
                            {formatQty(fill.qty, config.qtyScale)}
                        </td>
                        <td className="px-4 py-2 text-right">
                            <span className={`text-[11px] font-medium
                                ${fill.role === "MAKER" ? "text-accent" : "text-mid"}`}>
                                {fill.role}
                            </span>
                        </td>
                        <td className="px-4 py-2 font-mono text-lo text-right text-[11px]">
                            {new Date(fill.executedAt).toLocaleTimeString()}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
