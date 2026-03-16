import React, { useEffect, useState } from "react"
import type { MarketConfig } from "../types/market"
import { fetchFillHistory, type FillDTO } from "../lib/apiClient"
import { formatPrice, formatQty } from "../lib/format"

type Props = { market: string; config: MarketConfig }

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

    if (loading) return <div className="flex items-center justify-center h-full text-[13px] font-medium text-lo">Loading data...</div>
    if (error) return <div className="flex items-center justify-center h-full text-[13px] font-medium text-bear">Failed to load history</div>
    if (fills.length === 0) return <div className="flex items-center justify-center h-full text-[13px] font-medium text-lo">No fills recorded</div>

    return (
        <div className="w-full h-full overflow-x-auto overflow-y-auto scrollbar-thin">
            <table className="w-full min-w-[640px] text-left border-collapse">
                <thead className="sticky top-0 bg-panel z-10 after:absolute after:inset-x-0 after:bottom-0 after:border-b after:border-line">
                    <tr>
                        {["Side", "Price", "Qty", "Role", "Time"].map((header, i) => (
                            <th
                                key={header}
                                className={`px-5 py-3 text-[11px] font-medium text-lo uppercase tracking-wider
                                    ${i > 0 ? "text-right" : ""}`}
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-line/40">
                    {fills.map((fill) => (
                        <tr key={fill.id} className="hover:bg-raised/40 transition-colors group">
                            <td className={`px-5 py-2.5 text-[12px] font-bold ${fill.side === "BUY" ? "text-bull" : "text-bear"}`}>
                                {fill.side}
                            </td>
                            <td className="px-5 py-2.5 font-mono tabular-nums text-[12px] text-hi text-right font-medium">
                                {formatPrice(fill.price, config.priceScale)}
                            </td>
                            <td className="px-5 py-2.5 font-mono tabular-nums text-[12px] text-hi text-right">
                                {formatQty(fill.qty, config.qtyScale)}
                            </td>
                            <td className="px-5 py-2.5 text-right">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm
                                    ${fill.role === "MAKER" ? "bg-accent/10 text-accent" : "bg-line text-mid"}`}>
                                    {fill.role}
                                </span>
                            </td>
                            <td className="px-5 py-2.5 font-mono tabular-nums text-lo text-right text-[12px]">
                                {new Date(fill.executedAtMs).toLocaleTimeString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
