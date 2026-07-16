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
        <div className="flex flex-col gap-0.5">
            <span className={`text-[12px] font-mono tabular-nums font-bold leading-none ${valueClass}`}>{value}</span>
            <span className="text-[10px] text-lo font-medium tracking-wide uppercase leading-none">{label}</span>
        </div>
    )
}

function ReversedStatCell({ label, value, valueClass = "text-hi" }: { label: string; value: string; valueClass?: string }): React.JSX.Element {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-lo font-medium tracking-wide uppercase leading-none">{label}</span>
            <span className={`text-[12px] font-mono tabular-nums font-bold leading-none ${valueClass}`}>{value}</span>
        </div>
    )
}

export const MarketHeaderBar = React.memo(function MarketHeaderBar(props: Props): React.JSX.Element {
    const { config, stats, bestBidPrice, bestAskPrice } = props

    const lastPriceText = stats.lastPrice ? `₹${formatPrice(stats.lastPrice, config.priceScale)}` : "-"

    const changeText = stats.changeBps !== null ? (stats.changeBps > 0n ? "+" : "") + formatBpsAsPercent(stats.changeBps) + "%" : "-"
    const changeColor = stats.changeBps === null ? "text-mid" : stats.changeBps > 0n ? "text-bull" : stats.changeBps < 0n ? "text-bear" : "text-mid"

    const volumeText = stats.windowQtySum ? formatQty(stats.windowQtySum, config.qtyScale) : "-"
    const spreadRaw = computeSpread(bestBidPrice, bestAskPrice)
    const spreadText = spreadRaw ? `₹${formatPrice(spreadRaw, config.priceScale)}` : "-"

    return (
        <div className="flex items-center h-full pl-5 gap-8 overflow-x-auto scrollbar-hide">
            
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-base border border-line flex items-center justify-center text-[12px] font-bold text-hi shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]">
                    {config.market.slice(0, 1)}
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-[16px] font-bold text-hi leading-none tracking-tight">{config.displayName.split(' ')[0] || config.displayName} {config.displayName.split(' ')[1] || ''}</span>
                    <span className="text-[11px] font-mono font-medium text-lo">{config.market}</span>
                </div>
            </div>

            <div className="flex items-center flex-shrink-0 min-w-[100px]">
                <span className="text-[20px] font-mono tabular-nums font-bold tracking-tight text-hi">
                    {lastPriceText}
                </span>
            </div>

            <div className="flex items-center gap-8">
                <StatCell label="24H CHANGE" value={changeText} valueClass={changeColor} />
                <ReversedStatCell label="VOLUME" value={volumeText} />
                <ReversedStatCell label="SPREAD" value={spreadText} />
            </div>
        </div>
    )
})
