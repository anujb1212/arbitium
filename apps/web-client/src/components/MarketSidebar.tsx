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

    return (
        <div className="flex flex-col h-full bg-panel border-r border-line overflow-hidden">
            <div className="flex-1 overflow-y-auto scrollbar-thin pt-2">
                <div className="px-4 pb-2 text-[10px] font-medium text-lo uppercase tracking-wider flex justify-between">
                    <span>Market</span>
                    <span>Price</span>
                </div>
                {MARKETS.map((m) => {
                    const t = tickers.get(m.market)
                    const config = getMarketConfig(m.market)!
                    const pct = t?.changePct ? parseFloat(t.changePct) : null
                    const pctColor = pct === null ? "text-mid" : pct > 0 ? "text-bull" : pct < 0 ? "text-bear" : "text-mid"
                    const isActive = m.market === selectedMarket

                    return (
                        <button
                            key={m.market}
                            onClick={() => onMarketChange(m.market)}
                            className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-raised transition-all active:scale-[0.98] group
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