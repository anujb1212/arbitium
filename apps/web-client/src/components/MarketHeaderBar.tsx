import React from "react"
import type { MarketConfig } from "../types/market"
import type { MarketStats } from "../hooks/useMarketStats"
import { formatPrice, formatQty } from "../lib/format"
import { formatBpsAsPercent, parseBigIntDecimal } from "../lib/bigint"

type Props = {
    config: MarketConfig;
    stats: MarketStats;
    bestBidPrice: string | null;
    bestAskPrice: string | null;
    onToggleSidebar: () => void;
}

export function computeSpread(bid: string | null, ask: string | null): string | null {
    if (!bid || !ask) return null
    const b = parseBigIntDecimal(bid)
    const a = parseBigIntDecimal(ask)
    if (a < b) return null
    return (a - b).toString()
}

function StatCell({ label, value, valueClass = "text-hi" }: { label: string; value: string; valueClass?: string }): React.JSX.Element {
    return (
        <div className="flex flex-col gap-1 px-5 border-r border-line last:border-r-0">
            <span className="text-[11px] text-lo font-medium tracking-wide uppercase">{label}</span>
            <span className={`text-[13px] font-mono tabular-nums font-medium leading-none ${valueClass}`}>{value}</span>
        </div>
    )
}

export function MarketHeaderBar(props: Props): React.JSX.Element {
    const { config, stats, bestBidPrice, bestAskPrice, onToggleSidebar } = props

    const lastPriceText = stats.lastPrice ? `${formatPrice(stats.lastPrice, config.priceScale)}` : "-"
    const lastPriceColor = stats.direction === "UP" ? "text-bull" : stats.direction === "DOWN" ? "text-bear" : "text-hi"

    const changeText = stats.changeBps !== null ? formatBpsAsPercent(stats.changeBps) : "-"
    const changeColor = stats.changeBps === null ? "text-mid" : stats.changeBps > 0n ? "text-bull" : stats.changeBps < 0n ? "text-bear" : "text-mid"

    const volumeText = stats.windowQtySum ? formatQty(stats.windowQtySum, config.qtyScale) : "-"
    const spreadRaw = computeSpread(bestBidPrice, bestAskPrice)
    const spreadText = spreadRaw ? `${formatPrice(spreadRaw, config.priceScale)}` : "-"

    return (
        <div className="flex items-center h-full border-b border-line bg-panel px-4 gap-6 overflow-x-auto scrollbar-hide">

            <div className="flex items-center gap-3 flex-shrink-0 py-2">
                <button
                    onClick={onToggleSidebar}
                    className="p-1.5 -ml-1.5 rounded-md hover:bg-raised text-lo hover:text-hi transition-colors active:scale-95"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>

                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-base border border-line flex items-center justify-center text-[12px] font-bold text-hi shadow-sm">
                        {config.market.slice(0, 1)}
                    </div>
                    <span className="text-[18px] font-bold text-hi leading-none tracking-tight">{config.displayName}</span>
                </div>
            </div>

            <div className="w-px h-8 bg-line flex-shrink-0" />

            <div className="flex items-center flex-shrink-0 min-w-[120px]">
                <span className={`text-[22px] font-mono tabular-nums font-bold tracking-tight ${lastPriceColor}`}>
                    {lastPriceText}
                </span>
            </div>

            <div className="flex items-center gap-1">
                <StatCell label="24h Change" value={changeText} valueClass={changeColor} />
                <StatCell label="24h Volume" value={volumeText} />
                <StatCell label="Spread" value={spreadText} />
            </div>
        </div>
    )
}
