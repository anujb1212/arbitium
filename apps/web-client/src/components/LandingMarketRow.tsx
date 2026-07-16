import React from 'react'
import { getMarketConfig } from '../types/market'
import { formatPrice, formatQty } from '../lib/format'
import { ChangeCell } from './ChangeCell'
import { TickerSnapshot } from '../lib/apiClient'

type Props = {
    market: string;
    displayName: string;
    ticker: TickerSnapshot | null;
    isSelected: boolean;
    onSelect: (marketId: string) => void;
}

const LandingMarketRow = React.memo(function LandingMarketRow({ market, displayName, ticker, isSelected, onSelect }: Props): React.JSX.Element {
    const config = getMarketConfig(market)!
    const lastPrice = ticker?.lastPrice ?? null
    const pctStr = ticker?.priceChangePct24h ?? undefined
    const volume = ticker?.volume24h ?? "0"

    const handleClick = React.useCallback(() => onSelect(market), [onSelect, market])

    return (
        <tr 
            onClick={handleClick} 
            className={`group cursor-pointer transition-colors ${isSelected ? 'bg-raised/80' : 'hover:bg-raised/40'}`}
        >
            <td className="px-4 py-3 md:px-6 md:py-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-[inset_0_0_10px_rgba(255,255,255,0.1)]" style={{ backgroundColor: market.length % 2 === 0 ? '#F7931A' : '#627EEA' }}>
                        <span className="text-[12px] font-bold text-white shadow-sm">{market.slice(0, 1)}</span>
                    </div>
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
                    <span className="text-[10px] text-lo">-</span>
                </div>
            </td>
        </tr>
    )
})

export { LandingMarketRow }
