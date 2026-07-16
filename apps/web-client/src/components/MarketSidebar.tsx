import React, { useEffect, useState, useMemo } from "react"
import { MARKETS, getMarketConfig } from "../types/market"
import { fetchTicker } from "../lib/apiClient"
import { formatPrice } from "../lib/format"
import { Search, Star, ChevronDown, Plus } from "lucide-react"

type MiniTicker = { lastPrice: string | null; changePct: string | null }

type Props = {
    selectedMarket: string
    onMarketChange: (market: string) => void
}

type MarketItemProps = {
    market: { market: string; displayName: string }
    ticker: MiniTicker | undefined
    isActive: boolean
    onSelect: (market: string) => void
}

const MarketItem = React.memo(function MarketItem({ market: m, ticker: t, isActive, onSelect }: MarketItemProps): React.JSX.Element {
    const config = getMarketConfig(m.market)!
    const pct = t?.changePct ? parseFloat(t.changePct) : null
    const pctColor = pct === null ? "text-mid" : pct > 0 ? "text-bull" : pct < 0 ? "text-bear" : "text-mid"

    const handleClick = React.useCallback(() => onSelect(m.market), [onSelect, m.market])

    return (
        <button
            onClick={handleClick}
            className={`w-full flex items-center justify-between px-5 py-2.5 hover:bg-raised transition-all group
                ${isActive ? "bg-raised border-l-2 border-accent pl-[18px]" : "border-l-2 border-transparent"}`}
        >
            <div className="flex items-center gap-3">
                <div className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 shadow-[inset_0_0_10px_rgba(255,255,255,0.1)]" style={{ backgroundColor: m.market.length % 2 === 0 ? '#F7931A' : '#627EEA' }}>
                    {m.market.slice(0, 1)}
                </div>
                <div className="text-left">
                    <div className={`text-[12px] font-bold leading-none ${isActive ? 'text-hi' : 'text-mid group-hover:text-hi'}`}>{m.displayName}</div>
                    <div className="text-[9px] font-mono font-medium text-lo mt-1 uppercase">{config.market}</div>
                </div>
            </div>
            <div className="text-right">
                {t?.lastPrice ? (
                    <div className="font-mono tabular-nums text-[12px] font-bold text-hi leading-none tracking-tight">
                        ₹{formatPrice(t.lastPrice, config.priceScale)}
                    </div>
                ) : (
                    <div className="text-lo text-[12px] leading-none">-</div>
                )}
                {t?.changePct && (
                    <div className={`font-mono tabular-nums text-[10px] font-bold mt-1 tracking-tight ${pctColor}`}>
                        {pct! > 0 ? "+" : ""}{t.changePct}%
                    </div>
                )}
            </div>
        </button>
    )
})

export const MarketSidebar = React.memo(function MarketSidebar({ selectedMarket, onMarketChange }: Props): React.JSX.Element {
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

    const filteredMarkets = useMemo(
        () => MARKETS.filter(m => m.displayName.toLowerCase().includes(search.toLowerCase()) || m.market.toLowerCase().includes(search.toLowerCase())),
        [search]
    )

    const favorites = useMemo(() => filteredMarkets.slice(0, 3), [filteredMarkets])
    const indices = useMemo(() => filteredMarkets.filter(m => m.market.includes('INDEX')), [filteredMarkets])
    const equities = useMemo(() => filteredMarkets.filter(m => !m.market.includes('INDEX')).slice(3), [filteredMarkets])

    return (
        <div className="flex flex-col h-full bg-panel overflow-hidden border-r border-line">
            <div className="px-3 py-3 border-b border-line flex-shrink-0">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-lo w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search markets..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-base border border-line rounded-[4px] pl-9 pr-8 py-2 text-[12px] font-medium text-hi outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 placeholder:text-lo transition-all"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-lo font-mono bg-panel border border-line px-1.5 rounded-[3px]">
                        /
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
                
                {favorites.length > 0 && (
                    <div className="mb-4">
                        <div className="flex items-center gap-2 px-5 pb-1.5 text-[10px] font-bold text-lo tracking-widest uppercase">
                            <Star className="w-3.5 h-3.5" /> FAVORITES
                        </div>
                        {favorites.map((m) => (
                            <MarketItem
                                key={m.market}
                                market={m}
                                ticker={tickers.get(m.market)}
                                isActive={m.market === selectedMarket}
                                onSelect={onMarketChange}
                            />
                        ))}
                    </div>
                )}

                {indices.length > 0 && (
                    <div className="mb-4">
                        <div className="flex items-center justify-between px-5 pb-1.5 text-[10px] font-bold text-lo tracking-widest uppercase">
                            <div className="flex items-center gap-2">
                                <ChevronDown className="w-3.5 h-3.5" /> INDICES
                            </div>
                            <span className="bg-raised px-1.5 py-0.5 rounded-[3px] text-hi">{indices.length}</span>
                        </div>
                        {indices.map((m) => (
                            <MarketItem
                                key={m.market}
                                market={m}
                                ticker={tickers.get(m.market)}
                                isActive={m.market === selectedMarket}
                                onSelect={onMarketChange}
                            />
                        ))}
                    </div>
                )}

                {equities.length > 0 && (
                    <div className="mb-4">
                        <div className="flex items-center justify-between px-5 pb-1.5 text-[10px] font-bold text-lo tracking-widest uppercase">
                            <div className="flex items-center gap-2">
                                <ChevronDown className="w-3.5 h-3.5" /> EQUITIES
                            </div>
                            <span className="bg-raised px-1.5 py-0.5 rounded-[3px] text-hi">{equities.length}</span>
                        </div>
                        {equities.map((m) => (
                            <MarketItem
                                key={m.market}
                                market={m}
                                ticker={tickers.get(m.market)}
                                isActive={m.market === selectedMarket}
                                onSelect={onMarketChange}
                            />
                        ))}
                    </div>
                )}
                
                <div className="px-5 py-4">
                    <button className="flex items-center gap-2 text-[11px] font-medium text-lo hover:text-hi transition-colors group">
                        <Plus className="w-3.5 h-3.5 group-hover:text-accent transition-colors" /> Add to Watchlist
                    </button>
                </div>

            </div>
            
            <div className="border-t border-line px-5 py-3 flex-shrink-0 bg-base">
                <button className="flex items-center gap-2 text-[12px] font-medium text-hi group">
                    <svg className="w-4 h-4 text-lo group-hover:text-accent transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                    Market Overview
                </button>
            </div>
            
        </div>
    )
})
