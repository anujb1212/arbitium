import React from 'react'
import type { DisplayLevel } from '../hooks/useOrderBook'
import type { MarketConfig } from '../types/market'
import { formatPrice, formatQty } from '../lib/format'

type RowProps = { level: DisplayLevel; side: 'BUY' | 'SELL'; config: MarketConfig }

function BookRow({ level, side, config }: RowProps): React.JSX.Element {
    return (
        <div className="relative grid grid-cols-3 h-[21px] px-4 items-center hover:bg-raised cursor-default">
            <div
                className={`absolute inset-y-0 right-0 pointer-events-none
                    transition-[width] duration-100
                    ${side === 'BUY' ? 'bg-bull/[0.12]' : 'bg-bear/[0.12]'}`}
                style={{ width: `${level.depthPct}%` }}
            />
            <span className={`relative z-10 font-mono text-xs font-medium
                        ${side === 'BUY' ? 'text-bull' : 'text-bear'}`}>
                {formatPrice(level.price, config.priceScale)}
            </span>
            <span className="relative z-10 font-mono text-xs text-mid text-right">
                {formatQty(level.qty.toString(), config.qtyScale)}
            </span>
            <span className="relative z-10 font-mono text-xs text-mid text-right">
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

    return (
        <div className="flex flex-col h-full overflow-hidden select-none">
            <div className="px-4 py-2.5 text-xs font-semibold text-hi border-b border-line flex-shrink-0">
                Order Book
            </div>

            <div className="grid grid-cols-3 px-4 py-1.5 text-[11px] text-lo flex-shrink-0">
                <span>Price ({config.currency})</span>
                <span className="text-right">Qty</span>
                <span className="text-right">Total</span>
            </div>

            {/* Asks */}
            <div className="flex flex-col justify-end flex-1 overflow-hidden min-h-0">
                {displayAsks.map((lvl) => (
                    <BookRow key={lvl.price} level={lvl} side="SELL" config={config} />
                ))}
            </div>

            {/* Spread */}
            <div className="flex justify-between items-center px-4 py-1.5
                      border-y border-line bg-base flex-shrink-0">
                <span className="text-[11px] text-lo">Spread</span>
                <span className="font-mono text-xs text-mid">{spread}</span>
            </div>

            {/* Bids */}
            <div className="flex flex-col flex-1 overflow-hidden min-h-0">
                {bids.map((lvl) => (
                    <BookRow key={lvl.price} level={lvl} side="BUY" config={config} />
                ))}
            </div>

        </div>
    )
}
