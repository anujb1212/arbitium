import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Star } from 'lucide-react'
import { RecentTrade, TickerSnapshot } from '../lib/apiClient';
import { getMarketConfig, MARKETS } from '../types/market';
import { formatPrice, formatQty } from '../lib/format';
import { ChangeCell } from './ChangeCell';
import { Sparkline } from './Sparkline';


type MarketData = { ticker: TickerSnapshot | null; trades: RecentTrade[] }

export function MarketOverviewTable({ marketData }: { marketData: Map<string, MarketData> }): React.JSX.Element {
    const navigate = useNavigate()

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-[18px] font-black text-hi tracking-tight">Market Overview</h2>
                <button className="text-[12px] font-bold text-hi bg-panel border border-line hover:bg-raised px-4 py-2 rounded-[4px] transition-colors">
                    View all markets
                </button>
            </div>

            <div className="rounded-xl border border-line overflow-hidden bg-panel shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-panel border-b border-line">
                        <tr>
                            <th className="px-8 py-5 text-[10px] font-bold text-lo uppercase tracking-wider">Asset</th>
                            <th className="text-right px-8 py-5 text-[10px] font-bold text-lo uppercase tracking-wider">Last Price</th>
                            <th className="text-right px-8 py-5 text-[10px] font-bold text-lo uppercase tracking-wider">24h Change</th>
                            <th className="text-right px-8 py-5 text-[10px] font-bold text-lo uppercase tracking-wider">24h Volume</th>
                            <th className="text-right px-8 py-5 text-[10px] font-bold text-lo uppercase tracking-wider hidden md:table-cell">Open Interest</th>
                            <th className="text-right px-8 py-5 text-[10px] font-bold text-lo uppercase tracking-wider">24h Chart</th>
                            <th className="w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                        {MARKETS.map((m) => {
                            const config = getMarketConfig(m.market)!
                            const data = marketData.get(m.market)
                            const ticker = data?.ticker ?? null
                            const trades = data?.trades ?? []
                            const pctNumeric = ticker ? parseFloat(ticker.priceChangePct24h) : 0

                            const hash = m.market.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
                            const mockOI = `$${(hash * 2.34).toFixed(2)}${hash % 2 === 0 ? 'B' : 'M'}`

                            return (
                                <tr key={m.market} onClick={() => navigate(`/trade/${m.market}`)} className="group cursor-pointer hover:bg-raised transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-[inset_0_0_10px_rgba(255,255,255,0.1)]" style={{ backgroundColor: m.market.length % 2 === 0 ? '#F7931A' : '#627EEA' }}>
                                                <span className="text-[12px] font-bold text-white shadow-sm">{m.market.slice(0, 1)}</span>
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <div className="text-[14px] font-bold text-hi">{m.displayName.split(' ')[0] || m.displayName}</div>
                                                <div className="text-[12px] font-mono font-medium text-lo">{m.market.replace('-', '/')}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        {ticker?.lastPrice ? (
                                            <span className="font-mono tabular-nums text-[14px] font-bold text-hi tracking-tight">
                                                {formatPrice(ticker.lastPrice, config.priceScale)} <span className="text-[11px] text-lo font-sans ml-1">{formatPrice(ticker.lastPrice, config.priceScale)}</span>
                                            </span>
                                        ) : <span className="text-lo">-</span>}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <ChangeCell pct={ticker?.priceChangePct24h} />
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        {ticker?.volume24h ? (
                                            <span className="font-mono tabular-nums text-[13px] font-bold text-mid">
                                                ${formatQty(ticker.volume24h, config.qtyScale)}B
                                            </span>
                                        ) : <span className="text-lo">-</span>}
                                    </td>
                                    <td className="px-8 py-5 text-right hidden md:table-cell">
                                        <span className="font-mono tabular-nums text-[13px] font-bold text-mid">{mockOI}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex justify-end pr-4">
                                            <Sparkline
                                                candles={null}
                                                positive={pctNumeric >= 0}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-5 text-right">
                                        <Star size={16} className="text-lo group-hover:text-mid transition-colors opacity-50 hover:opacity-100" />
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
