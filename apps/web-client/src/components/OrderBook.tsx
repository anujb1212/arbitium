import React from 'react'
import type { DisplayLevel } from '../hooks/useOrderBook'
import type { MarketConfig } from '../types/market'
import { formatPrice, formatQty } from '../lib/format'

type RowProps = { level: DisplayLevel; side: 'BUY' | 'SELL'; config: MarketConfig }

function BookRow({ level, side, config }: RowProps): React.JSX.Element {
    return (
        <div className="relative grid grid-cols-3 h-[20px] px-3 items-center hover:bg-raised cursor-default">
            <div
                className={`absolute inset-y-0 right-0 pointer-events-none
                    ${side === 'BUY' ? 'bg-bull/[0.10]' : 'bg-bear/[0.10]'}`}
                style={{ width: `${level.depthPct}%` }}
            />
            <span className={`relative z-10 font-mono text-[12px] font-medium
                ${side === 'BUY' ? 'text-bull' : 'text-bear'}`}>
                {formatPrice(level.price, config.priceScale)}
            </span>
            <span className="relative z-10 font-mono text-[12px] text-mid text-right">
                {formatQty(level.qty.toString(), config.qtyScale)}
            </span>
            <span className="relative z-10 font-mono text-[12px] text-lo text-right">
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
        <div className="flex flex-col h-full overflow-hidden select-none">
            <div className="grid grid-cols-3 px-3 py-1.5 text-[10px] text-lo flex-shrink-0 border-b border-line">
                <span>Price ({config.currency})</span>
                <span className="text-right">Qty</span>
                <span className="text-right">Total</span>
            </div>

            {/* Asks  */}
            <div className="flex flex-col justify-end flex-1 overflow-hidden min-h-0">
                {displayAsks.map((lvl) => (
                    <BookRow key={lvl.price} level={lvl} side="SELL" config={config} />
                ))}
            </div>

            {/* Spread */}
            <div className="flex justify-between items-center px-3 py-1
                border-y border-line bg-raised flex-shrink-0">
                <span className="text-[10px] text-lo">Spread</span>
                <span className="font-mono text-[11px] text-mid">{spread}</span>
            </div>

            {/* Bids  */}
            <div className="flex flex-col flex-1 overflow-hidden min-h-0">
                {bids.map((lvl) => (
                    <BookRow key={lvl.price} level={lvl} side="BUY" config={config} />
                ))}
            </div>

            {/* Bid/Ask */}
            <div className="flex items-center gap-2 px-3 py-1.5 border-t border-line flex-shrink-0 bg-base">
                <span className="text-[11px] font-mono text-bull w-10 text-left">{bidPct.toFixed(1)}%</span>
                <div className="flex-1 h-1.5 bg-bear/30 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-bull/70 rounded-full transition-[width] duration-300"
                        style={{ width: `${bidPct}%` }}
                    />
                </div>
                <span className="text-[11px] font-mono text-bear w-10 text-right">{askPct.toFixed(1)}%</span>
            </div>
        </div>
    )
}
