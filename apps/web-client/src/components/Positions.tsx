import React, { useEffect, useState } from "react"
import { fetchHoldings, HoldingDTO } from "../lib/apiClient"
import { getMarketConfig } from "../types/market"
import { formatPrice, formatQty } from "../lib/format"
import { isLoggedIn } from "../lib/auth"

type Props = {
    accountRefreshKey: number
}

export function Positions({ accountRefreshKey }: Props): React.JSX.Element {
    const [holdings, setHoldings] = useState<HoldingDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!isLoggedIn()) {
            setLoading(false)
            return
        }
        setLoading(true)
        setError(null)
        fetchHoldings()
            .then(setHoldings)
            .catch((err) => setError((err as Error).message))
            .finally(() => setLoading(false))
    }, [accountRefreshKey])

    if (loading) return <div className="flex items-center justify-center h-full text-[13px] font-medium text-lo">Loading positions...</div>
    if (error) return <div className="flex items-center justify-center h-full text-[13px] font-medium text-bear">Failed to load positions</div>
    if (holdings.length === 0) return (
        <div className="flex items-center justify-center h-full text-[13px] font-medium text-lo">
            No positions yet. Start trading to see your holdings here.
        </div>
    )

    return (
        <div className="w-full h-full overflow-x-auto overflow-y-auto scrollbar-thin">
            <table className="w-full min-w-[640px] text-left border-collapse">
                <thead className="sticky top-0 bg-panel z-10 after:absolute after:inset-x-0 after:bottom-0 after:border-b after:border-line">
                    <tr>
                        {["Asset", "Market", "Available", "Locked", "Net Qty", "Avg Price"].map((header, i) => (
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
                    {holdings.map((h) => {
                        const cfg = getMarketConfig(h.market)
                        const qtyScale = cfg?.qtyScale ?? 0
                        const priceScale = cfg?.priceScale ?? 2
                        return (
                            <tr key={h.market} className="hover:bg-raised/40 transition-colors group">
                                <td className="px-5 py-2.5 text-[12px] font-bold text-hi">
                                    {h.asset}
                                </td>
                                <td className="px-5 py-2.5 font-mono text-[12px] text-mid">
                                    {h.market}
                                </td>
                                <td className="px-5 py-2.5 font-mono tabular-nums text-[12px] text-hi text-right">
                                    {formatQty(h.availableQty, qtyScale)}
                                </td>
                                <td className="px-5 py-2.5 font-mono tabular-nums text-[12px] text-mid text-right">
                                    {formatQty(h.lockedQty, qtyScale)}
                                </td>
                                <td className="px-5 py-2.5 font-mono tabular-nums text-[12px] text-hi text-right font-bold">
                                    {formatQty(h.netQty, qtyScale)}
                                </td>
                                <td className="px-5 py-2.5 font-mono tabular-nums text-[12px] text-hi text-right">
                                    {formatPrice(h.avgBuyPrice, priceScale)}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
