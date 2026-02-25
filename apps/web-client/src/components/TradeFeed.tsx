import React from 'react'
import type { TradeEntry } from '../hooks/useTradeFeed'
import type { MarketConfig } from '../types/market'
import { formatPrice, formatQty } from '../lib/format'

function formatTime(ts: number): string {
    return new Date(ts).toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    })
}

type Props = { trades: TradeEntry[]; config: MarketConfig }

export function TradeFeed({ trades, config }: Props): React.JSX.Element {
    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="px-4 py-2.5 text-xs font-semibold text-hi border-b border-line flex-shrink-0">
                Recent Trades
            </div>
            <div className="grid grid-cols-3 px-4 py-1.5 text-[11px] text-lo flex-shrink-0">
                <span>Price</span>
                <span className="text-right">Qty</span>
                <span className="text-right">Time</span>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin">
                {trades.length === 0 ? (
                    <p className="text-center text-xs text-lo py-8">Waiting for trades…</p>
                ) : (
                    trades.map((trade) => (
                        <div key={trade.id}
                            className="grid grid-cols-3 h-[21px] px-4 items-center hover:bg-raised">
                            <span className={`font-mono text-xs font-medium
                               ${trade.takerSide === 'BUY' ? 'text-bull' : 'text-bear'}`}>
                                {formatPrice(trade.price, config.priceScale)}
                            </span>
                            <span className="font-mono text-xs text-mid text-right">
                                {formatQty(trade.qty, config.qtyScale)}
                            </span>
                            <span className="font-mono text-[11px] text-lo text-right">
                                {formatTime(trade.timestamp)}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
