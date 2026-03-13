import React, { useEffect, useRef, useState } from "react"
import type { MarketConfig } from "../types/market"
import type { MarketStats } from "../hooks/useMarketStats"
import { MARKETS, getMarketConfig } from "../types/market"
import { formatPrice, formatQty } from "../lib/format"
import { formatBpsAsPercent, parseBigIntDecimal } from "../lib/bigint"
import { fetchTicker } from "../lib/apiClient"

type Props = {
    config: MarketConfig
    stats: MarketStats
    bestBidPrice: string | null
    bestAskPrice: string | null
    onMarketChange: (market: string) => void
}

type MiniTicker = { lastPrice: string | null; changePct: string | null }

function computeSpread(bid: string | null, ask: string | null): string | null {
    if (!bid || !ask) return null
    const b = parseBigIntDecimal(bid)
    const a = parseBigIntDecimal(ask)
    if (a < b) return null
    return (a - b).toString()
}

function MarketDropdown(props: {
    config: MarketConfig
    onSelect: (market: string) => void
}): React.JSX.Element {
    const { config, onSelect } = props
    const [open, setOpen] = useState(false)
    const [tickers, setTickers] = useState<Map<string, MiniTicker>>(new Map())
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function onOutside(e: MouseEvent): void {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        if (open) document.addEventListener("mousedown", onOutside)
        return () => document.removeEventListener("mousedown", onOutside)
    }, [open])

    useEffect(() => {
        if (!open) return
        Promise.all(
            MARKETS.map((m) =>
                fetchTicker(m.market)
                    .then((s): [string, MiniTicker] => [
                        m.market,
                        { lastPrice: s.lastPrice ?? null, changePct: s.priceChangePct24h ?? null }
                    ])
                    .catch((): [string, MiniTicker] => [m.market, { lastPrice: null, changePct: null }])
            )
        ).then((entries) => setTickers(new Map(entries)))
    }, [open])

    return (
        <div className="relative flex-shrink-0" ref={ref}>
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg
                    hover:bg-raised transition-colors group"
            >
                <div className="w-7 h-7 rounded-full bg-raised border border-line
                    flex items-center justify-center text-[12px] font-bold text-hi flex-shrink-0">
                    {config.market.slice(0, 1)}
                </div>
                <div className="text-left">
                    <div className="text-[13px] font-bold text-hi leading-tight">{config.displayName}</div>
                    <div className="text-[10px] font-mono text-lo leading-tight">{config.market}</div>
                </div>
                <svg
                    width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5"
                    className={`text-lo transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`}
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {open && (
                <div className="absolute top-full left-0 mt-1 w-72 bg-panel border border-line
                    rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="py-1">
                        {MARKETS.map((m) => {
                            const t = tickers.get(m.market)
                            const mConfig = getMarketConfig(m.market)!
                            const pct = t?.changePct ? parseFloat(t.changePct) : null
                            const pctColor = pct === null ? "text-mid"
                                : pct > 0 ? "text-bull" : pct < 0 ? "text-bear" : "text-mid"
                            const isActive = m.market === config.market

                            return (
                                <button
                                    key={m.market}
                                    onClick={() => { onSelect(m.market); setOpen(false) }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5
                                        hover:bg-raised transition-colors
                                        ${isActive ? "bg-accent/10" : ""}`}
                                >
                                    <div className="w-8 h-8 rounded-full bg-base border border-line
                                        flex items-center justify-center text-[12px] font-bold text-hi flex-shrink-0">
                                        {m.market.slice(0, 1)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-[13px] font-semibold text-hi truncate">
                                                {m.displayName}
                                            </span>
                                            {t?.lastPrice && (
                                                <span className="font-mono text-[12px] text-hi flex-shrink-0">
                                                    {formatPrice(t.lastPrice, mConfig.priceScale)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between gap-2 mt-0.5">
                                            <span className="text-[10px] font-mono text-lo">{m.market}</span>
                                            {t?.changePct && (
                                                <span className={`font-mono text-[11px] flex-shrink-0 ${pctColor}`}>
                                                    {pct! > 0 ? "+" : ""}{t.changePct}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

function StatCell({ label, value, valueClass = "text-hi" }: {
    label: string; value: string; valueClass?: string
}): React.JSX.Element {
    return (
        <div className="flex flex-col gap-0.5 px-4 border-r border-line last:border-r-0">
            <span className="text-[10px] text-lo leading-none whitespace-nowrap">{label}</span>
            <span className={`text-[13px] font-mono font-medium leading-tight whitespace-nowrap ${valueClass}`}>
                {value}
            </span>
        </div>
    )
}

export function MarketHeaderBar(props: Props): React.JSX.Element {
    const { config, stats, bestBidPrice, bestAskPrice, onMarketChange } = props

    const lastPriceText = stats.lastPrice
        ? `₹${formatPrice(stats.lastPrice, config.priceScale)}`
        : "—"
    const lastPriceColor = stats.direction === "UP" ? "text-bull"
        : stats.direction === "DOWN" ? "text-bear" : "text-hi"

    const changeText = stats.changeBps !== null
        ? formatBpsAsPercent(stats.changeBps)
        : "—"
    const changeColor = stats.changeBps === null ? "text-mid"
        : stats.changeBps > 0n ? "text-bull"
            : stats.changeBps < 0n ? "text-bear" : "text-mid"

    const volumeText = stats.windowQtySum
        ? formatQty(stats.windowQtySum, config.qtyScale)
        : "—"

    const spreadRaw = computeSpread(bestBidPrice, bestAskPrice)
    const spreadText = spreadRaw
        ? `₹${formatPrice(spreadRaw, config.priceScale)}`
        : "—"

    return (
        <div className="flex items-center h-full border-b border-line bg-panel px-2 overflow-x-auto gap-2">
            <MarketDropdown config={config} onSelect={onMarketChange} />

            <div className="w-px h-7 bg-line flex-shrink-0 mx-1" />

            <div className="flex items-center flex-shrink-0">
                <span className={`text-[20px] font-mono font-bold leading-none ${lastPriceColor}`}>
                    {lastPriceText}
                </span>
            </div>

            <div className="w-px h-7 bg-line flex-shrink-0 mx-1" />

            <div className="flex items-center overflow-x-auto gap-0">
                <StatCell label="24h Change" value={changeText} valueClass={changeColor} />
                <StatCell label="24h Volume" value={volumeText} />
                <StatCell label="Spread" value={spreadText} />
            </div>
        </div>
    )
}
