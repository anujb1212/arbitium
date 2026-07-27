import React from 'react'
import { getMarketConfig } from '../types/market'
import { formatPrice, formatQty } from '../lib/format'
import { ChangeCell } from './ChangeCell'
import { Sparkline } from './Sparkline'
import { Logo } from './Logo'
import type { TickerSnapshot, SparklineCandle } from '../lib/apiClient'

type Props = {
    market: string;
    displayName: string;
    ticker: TickerSnapshot | null;
    sparklineCandles: SparklineCandle[] | null;
    isSelected: boolean;
    onSelect: (marketId: string) => void;
}

const LandingMarketRow = React.memo(function LandingMarketRow({ market, displayName, ticker, sparklineCandles, isSelected, onSelect }: Props): React.JSX.Element {
    const config = getMarketConfig(market)!
    const lastPrice = ticker?.lastPrice ?? null
    const pctStr = ticker?.priceChangePct24h ?? undefined
    const volume = ticker?.volume24h ?? "0"
    const pct = pctStr ? parseFloat(pctStr) : 0

    const handleClick = React.useCallback(() => onSelect(market), [onSelect, market])

    return (
        <tr 
            onClick={handleClick} 
            className={`group cursor-pointer transition-colors ${isSelected ? 'bg-raised/80' : 'hover:bg-raised/40'}`}
        >
            <td className="px-4 py-3 md:px-6 md:py-4">
                <div className="flex items-center gap-3">
                    <Logo market={market} size={32} />
                    <div className="flex flex-col items-start justify-center">
                        <div className="text-[14px] font-bold text-hi leading-tight">{displayName.split(' ')[0] || displayName}</div>
                        <div className="text-[11px] font-mono font-medium text-lo">{market.replace('-', '/')}</div>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3 md:px-6 md:py-4 text-right">
                {lastPrice ? (
                    <span className="font-mono tabular-nums text-[14px] font-bold text-hi tracking-tight">
                        {formatPrice(lastPrice, config.priceScale)}
                    </span>
                ) : <span className="text-lo">-</span>}
            </td>
            <td className="px-4 py-3 md:px-6 md:py-4 text-right">
                <ChangeCell pct={pctStr} />
            </td>
            <td className="px-4 py-3 md:px-6 md:py-4 text-right hidden sm:table-cell">
                {volume && volume !== "0" ? (
                    <span className="font-mono tabular-nums text-[13px] font-medium text-mid">
                        {formatQty(volume, config.qtyScale)}
                    </span>
                ) : <span className="text-lo">-</span>}
            </td>
            <td className="px-4 py-3 md:px-6 md:py-4 hidden md:table-cell">
                <div className="flex justify-end">
                    <Sparkline candles={sparklineCandles} positive={pct >= 0} />
                </div>
            </td>
        </tr>
    )
})

export { LandingMarketRow }
