import React from 'react'
import type { DisplayLevel } from '../hooks/useOrderBook'
import type { MarketConfig } from '../types/market'
import { formatPrice, formatQty } from '../lib/format'

type RowProps = { level: DisplayLevel; side: 'BUY' | 'SELL'; config: MarketConfig }

function BookRow({ level, side, config }: RowProps): React.JSX.Element {
    return (
        <div className="relative grid grid-cols-3 h-[22px] px-4 items-center hover:bg-raised transition-colors cursor-default group">
            <div
                className={`absolute inset-y-0 right-0 pointer-events-none transition-all duration-200
                    ${side === 'BUY' ? 'bg-bull/10' : 'bg-bear/10'}`}
                style={{ width: `${level.depthPct}%` }}
            />
            <span className={`relative z-10 font-mono tabular-nums text-[12px] font-medium
                ${side === 'BUY' ? 'text-bull' : 'text-bear'}`}>
                {formatPrice(level.price, config.priceScale)}
            </span>
            <span className="relative z-10 font-mono tabular-nums text-[12px] text-mid text-right group-hover:text-hi transition-colors">
                {formatQty(level.qty.toString(), config.qtyScale)}
            </span>
            <span className="relative z-10 font-mono tabular-nums text-[12px] text-lo text-right">
                {formatQty(level.total.toString(), config.qtyScale)}
            </span>
        </div>
    )
}

type Props = { bids: DisplayLevel[]; asks: DisplayLevel[]; config: MarketConfig }

export function OrderBook({ bids, asks, config }: Props): React.JSX.Element {
    const displayAsks = [...asks].reverse()

    const spread =
        bids[0] && asks[0]
            ? formatPrice(
                (BigInt(asks[0].price) - BigInt(bids[0].price)).toString(),
                config.priceScale,
            )
            : '—'

    const bidTotal = bids.at(-1)?.total ?? 0n
    const askTotal = asks.at(-1)?.total ?? 0n
    const combined = bidTotal + askTotal
    const bidPct = combined > 0n ? Number((bidTotal * 10000n) / combined) / 100 : 50
    const askPct = Number((100 - bidPct).toFixed(1))

    return (
        <div className="flex flex-col h-full overflow-hidden select-none bg-panel">
            <div className="grid grid-cols-3 px-4 py-2 text-[11px] font-medium text-lo flex-shrink-0 border-b border-line uppercase tracking-wider">
                <span>Price ({config.currency})</span>
                <span className="text-right">Qty</span>
                <span className="text-right">Total</span>
            </div>

            {/* Asks  */}
            <div className="flex flex-col justify-end flex-1 overflow-hidden min-h-0 pt-1">
                {displayAsks.map((lvl) => (
                    <BookRow key={lvl.price} level={lvl} side="SELL" config={config} />
                ))}
            </div>

            {/* Spread */}
            <div className="flex justify-between items-center px-4 py-1.5 my-1
                border-y border-line bg-base flex-shrink-0">
                <span className="text-[11px] text-lo uppercase tracking-wide">Spread</span>
                <span className="font-mono tabular-nums text-[12px] text-hi font-medium">{spread}</span>
            </div>

            {/* Bids  */}
            <div className="flex flex-col flex-1 overflow-hidden min-h-0 pb-1">
                {bids.map((lvl) => (
                    <BookRow key={lvl.price} level={lvl} side="BUY" config={config} />
                ))}
            </div>

            {/* Bid/Ask Bar */}
            <div className="flex items-center gap-3 px-4 py-2 border-t border-line flex-shrink-0 bg-panel">
                <span className="text-[11px] font-mono tabular-nums text-bull w-9 text-left">{bidPct.toFixed(0)}%</span>
                <div className="flex-1 h-1.5 bg-bear/20 rounded-full overflow-hidden flex">
                    <div
                        className="h-full bg-bull rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${bidPct}%` }}
                    />
                    <div className="h-full bg-bear rounded-full flex-1" />
                </div>
                <span className="text-[11px] font-mono tabular-nums text-bear w-9 text-right">{askPct.toFixed(0)}%</span>
            </div>
        </div>
    )
}
