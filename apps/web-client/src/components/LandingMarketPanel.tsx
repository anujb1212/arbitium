import React from 'react'
import { useNavigate } from 'react-router-dom'
import { getMarketConfig } from '../types/market'
import { formatPrice, formatQty } from '../lib/format'
import { TickerSnapshot } from '../lib/apiClient'

type Props = {
    market: string;
    displayName: string;
    ticker: TickerSnapshot | null;
}

const LandingMarketPanel = React.memo(function LandingMarketPanel({ market, displayName, ticker }: Props): React.JSX.Element | null {
    const navigate = useNavigate()
    if (!market) return null

    const config = getMarketConfig(market)!
    const lastPrice = ticker?.lastPrice ?? null
    const pctStr = ticker?.priceChangePct24h ?? undefined
    const pctNumeric = pctStr ? parseFloat(pctStr) : 0
    const volume = ticker?.volume24h ?? "0"

    const isPositive = pctNumeric >= 0
    const color = isPositive ? 'text-bull' : 'text-bear'
    const prefix = isPositive ? '+' : ''

    return (
        <div className="flex flex-col bg-panel border border-line rounded-xl shadow-2xl overflow-hidden h-full">
            <div className="p-6 flex-1 flex flex-col justify-center">
                <div className="text-[12px] font-bold text-lo uppercase tracking-wider mb-1">Selected Market</div>
                <div className="text-[24px] font-black tracking-tight text-hi mb-6">{displayName}</div>
                
                <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
                    <div className="flex flex-col">
                        <span className="text-[11px] font-medium text-lo mb-1">Live Price</span>
                        {lastPrice ? (
                            <span className="font-mono tabular-nums text-[16px] font-bold text-hi">
                                {formatPrice(lastPrice, config.priceScale)}
                            </span>
                        ) : <span className="text-lo">-</span>}
                    </div>

                    <div className="flex flex-col">
                        <span className="text-[11px] font-medium text-lo mb-1">24h Change</span>
                        {pctStr ? (
                            <span className={`font-mono tabular-nums text-[16px] font-bold ${color}`}>
                                {prefix}{pctStr}%
                            </span>
                        ) : <span className="text-lo">-</span>}
                    </div>

                    <div className="flex flex-col col-span-2 border-t border-line/50 pt-6">
                        <span className="text-[11px] font-medium text-lo mb-1">24h Volume</span>
                        {volume && volume !== "0" ? (
                            <span className="font-mono tabular-nums text-[14px] font-medium text-mid">
                                {formatQty(volume, config.qtyScale)} {config.market.split('-')[0]}
                            </span>
                        ) : <span className="text-lo">-</span>}
                    </div>
                </div>
            </div>

            <div className="p-6 bg-raised/30 border-t border-line/50 mt-auto">
                <button
                    onClick={() => navigate(`/trade/${market}`)}
                    className="w-full bg-accent text-white font-bold text-[14px] py-3 rounded-lg hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20"
                >
                    Open Trade
                </button>
            </div>
        </div>
    )
})

export { LandingMarketPanel }
