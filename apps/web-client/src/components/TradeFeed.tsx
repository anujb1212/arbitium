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
        <div className="flex flex-col h-full bg-panel overflow-hidden">
            <div className="grid grid-cols-3 px-4 py-2 text-[11px] font-medium text-lo flex-shrink-0 border-b border-line uppercase tracking-wider">
                <span>Price</span>
                <span className="text-right">Qty</span>
                <span className="text-right">Time</span>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin pt-1 pb-1">
                {trades.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-[12px] text-lo">
                        Waiting for trades...
                    </div>
                ) : (
                    trades.map((trade) => (
                        <div key={trade.id}
                            className="grid grid-cols-3 h-[22px] px-4 items-center hover:bg-raised transition-colors cursor-default group">
                            <span className={`font-mono tabular-nums text-[12px] font-medium
                                ${trade.takerSide === 'BUY' ? 'text-bull' : 'text-bear'}`}>
                                {formatPrice(trade.price, config.priceScale)}
                            </span>
                            <span className="font-mono tabular-nums text-[12px] text-mid text-right group-hover:text-hi transition-colors">
                                {formatQty(trade.qty, config.qtyScale)}
                            </span>
                            <span className="font-mono tabular-nums text-[12px] text-lo text-right">
                                {formatTime(trade.timestamp)}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
