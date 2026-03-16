import React, { useEffect, useState } from "react"
import { MARKETS, getMarketConfig } from "../types/market"
import { fetchTicker } from "../lib/apiClient"
import { formatPrice } from "../lib/format"

type MiniTicker = { lastPrice: string | null; changePct: string | null }

type Props = {
    selectedMarket: string
    onMarketChange: (market: string) => void
}

export function MarketSidebar({ selectedMarket, onMarketChange }: Props): React.JSX.Element {
    const [tickers, setTickers] = useState<Map<string, MiniTicker>>(new Map())
    const [search, setSearch] = useState("")

    useEffect(() => {
        let active = true
        Promise.all(
            MARKETS.map((m) =>
                fetchTicker(m.market)
                    .then((s): [string, MiniTicker] => [m.market, { lastPrice: s.lastPrice ?? null, changePct: s.priceChangePct24h ?? null }])
                    .catch((): [string, MiniTicker] => [m.market, { lastPrice: null, changePct: null }])
            )
        ).then((entries) => {
            if (active) setTickers(new Map(entries))
        })
        return () => { active = false }
    }, [])

    const filtered = MARKETS.filter(m => m.displayName.toLowerCase().includes(search.toLowerCase()) || m.market.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className="flex flex-col h-full bg-panel border-r border-line overflow-hidden">

            <div className="p-3 border-b border-line flex-shrink-0">
                <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-lo">

                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Search markets..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-base border border-line rounded-md pl-8 pr-3 py-1.5 text-[12px] text-hi outline-none focus:border-accent transition-colors placeholder:text-lo"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin pt-2">
                <div className="px-4 pb-2 text-[10px] font-medium text-lo uppercase tracking-wider flex justify-between">
                    <span>Market</span>
                    <span>Price</span>
                </div>
                {filtered.map((m) => {
                    const t = tickers.get(m.market)
                    const config = getMarketConfig(m.market)!
                    const pct = t?.changePct ? parseFloat(t.changePct) : null
                    const pctColor = pct === null ? "text-mid" : pct > 0 ? "text-bull" : pct < 0 ? "text-bear" : "text-mid"
                    const isActive = m.market === selectedMarket

                    return (
                        <button
                            key={m.market}
                            onClick={() => onMarketChange(m.market)}
                            className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-raised transition-colors group
                                ${isActive ? "bg-raised border-l-2 border-accent pl-[14px]" : "border-l-2 border-transparent"}`}
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="w-6 h-6 rounded-full bg-base border border-line flex items-center justify-center text-[10px] font-bold text-hi flex-shrink-0 group-hover:border-mid/50 transition-colors">
                                    {m.market.slice(0, 1)}
                                </div>
                                <div className="text-left">
                                    <div className="text-[13px] font-bold text-hi leading-none">{m.displayName}</div>
                                    <div className="text-[10px] font-mono text-lo mt-1">{config.market}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                {t?.lastPrice ? (
                                    <div className="font-mono tabular-nums text-[12px] font-medium text-hi leading-none">
                                        {formatPrice(t.lastPrice, config.priceScale)}
                                    </div>
                                ) : (
                                    <div className="text-lo text-[12px] leading-none">-</div>
                                )}
                                {t?.changePct && (
                                    <div className={`font-mono tabular-nums text-[10px] font-bold mt-1 ${pctColor}`}>
                                        {pct! > 0 ? "+" : ""}{t.changePct}%
                                    </div>
                                )}
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
