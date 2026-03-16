import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MARKETS, getMarketConfig } from '../types/market'
import { clearToken, isLoggedIn, redirectToVaultlyLogin } from '../lib/auth'
import { fetchTicker, fetchRecentTrades } from '../lib/apiClient'
import { formatPrice, formatQty } from '../lib/format'
import type { TickerSnapshot, RecentTrade } from '../lib/apiClient'

const SPARK_W = 96
const SPARK_H = 32

function buildSparkPath(prices: number[]): string {
    if (prices.length < 2) return ''
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const range = max - min || 1
    return prices
        .map((p, i) => {
            const x = ((i / (prices.length - 1)) * SPARK_W).toFixed(1)
            const y = (SPARK_H - ((p - min) / range) * SPARK_H).toFixed(1)
            return `${i === 0 ? 'M' : 'L'}${x} ${y}`
        })
        .join(' ')
}

type SparklineProps = { trades: RecentTrade[]; positive: boolean }

function Sparkline({ trades, positive }: SparklineProps): React.JSX.Element | null {
    if (trades.length < 2) return (
        <div style={{ width: SPARK_W, height: SPARK_H }} className="flex items-center justify-center">
            <span className="text-[10px] text-lo">-</span>
        </div>
    )

    const prices = trades.map((t) => Number(t.price))
    const path = buildSparkPath(prices)
    const color = positive ? '#00c278' : '#ff3b69'

    return (
        <svg width={SPARK_W} height={SPARK_H} viewBox={`0 0 ${SPARK_W} ${SPARK_H}`} className="overflow-visible">
            <path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.9"
            />
        </svg>
    )
}

function ChangeCell({ pct }: { pct: string | undefined }): React.JSX.Element {
    if (!pct) return <span className="text-lo font-mono text-[13px]">-</span>
    const numeric = parseFloat(pct)
    const color = numeric > 0 ? 'text-bull' : numeric < 0 ? 'text-bear' : 'text-mid'
    const prefix = numeric > 0 ? '+' : ''
    return (
        <span className={`font-mono text-[13px] font-bold ${color}`}>
            {prefix}{pct}%
        </span>
    )
}

type MarketData = { ticker: TickerSnapshot | null; trades: RecentTrade[] }

export default function LandingPage(): React.JSX.Element {
    const navigate = useNavigate()
    const loggedIn = isLoggedIn()
    const [marketData, setMarketData] = useState<Map<string, MarketData>>(new Map())

    useEffect(() => {
        Promise.all(
            MARKETS.map(async (m): Promise<[string, MarketData]> => {
                const [ticker, trades] = await Promise.all([
                    fetchTicker(m.market).catch(() => null),
                    fetchRecentTrades(m.market).catch(() => [] as RecentTrade[])
                ])
                return [m.market, { ticker, trades }]
            })
        ).then((entries) => setMarketData(new Map(entries)))
    }, [])

    return (
        <div className="min-h-screen bg-base text-hi font-sans selection:bg-accent/30 flex flex-col">
            <header className="w-full h-16 flex items-center justify-between px-8 border-b border-line bg-panel/80 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <img
                        src="/logo.png"
                        alt="Arbitium Logo"
                        className="w-8 h-8 object-contain drop-shadow-lg"
                    />
                    <span className="text-[18px] font-black tracking-tighter text-hi uppercase">
                        Arbitium
                    </span>
                </div>
                <nav className="flex items-center gap-4">
                    {loggedIn ? (
                        <button onClick={() => { clearToken(); window.location.reload() }} className="text-[12px] font-bold text-mid hover:text-hi transition-colors">
                            Sign out
                        </button>
                    ) : (
                        <button onClick={redirectToVaultlyLogin} className="text-[12px] font-bold text-hi hover:text-mid transition-colors px-3 py-1.5 rounded-md hover:bg-raised">
                            Sign in
                        </button>
                    )}
                    <button onClick={() => navigate(`/trade/${MARKETS[0].market}`)} className="text-[12px] font-bold bg-hi text-base hover:bg-mid px-5 py-2 rounded-md transition-colors shadow-sm">
                        Trade Now
                    </button>
                </nav>
            </header>

            <main className="flex-1 flex flex-col items-center justify-start pt-24 pb-20 px-6 max-w-5xl mx-auto w-full">

                <div className="text-center mb-16 max-w-3xl">
                    <div className="inline-block mb-6 px-3 py-1 border border-line bg-panel rounded-full text-[11px] font-bold text-accent tracking-wide uppercase">
                        V1 Engine Live
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[1.1] mb-6 text-hi">
                        High-Frequency Trading <br />
                        <span className="text-mid">Made Accessible.</span>
                    </h1>
                    <p className="text-base md:text-lg text-lo font-medium leading-relaxed mb-8 max-w-xl mx-auto">
                        A deterministic matching engine. Experience millisecond execution.
                    </p>
                    <button onClick={() => navigate(`/trade/${MARKETS[0].market}`)} className="bg-accent hover:bg-accent/90 text-white font-bold text-[15px] px-8 py-3.5 rounded-lg transition-all active:scale-95 shadow-lg shadow-accent/20">
                        Launch Terminal
                    </button>
                </div>

                <div className="w-full">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <p className="text-[13px] font-bold text-hi tracking-wide">Market Overview</p>
                        <span className="text-[12px] text-mid font-medium">{MARKETS.length} Assets Listed</span>
                    </div>

                    <div className="rounded-xl border border-line overflow-hidden bg-panel shadow-2xl">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-base border-b border-line">
                                <tr>
                                    <th className="px-6 py-4 text-[11px] font-bold text-lo uppercase tracking-wider">Asset</th>
                                    <th className="text-right px-6 py-4 text-[11px] font-bold text-lo uppercase tracking-wider">Last Price</th>
                                    <th className="text-right px-6 py-4 text-[11px] font-bold text-lo uppercase tracking-wider">24h Change</th>
                                    <th className="text-right px-6 py-4 text-[11px] font-bold text-lo uppercase tracking-wider">24h Volume</th>
                                    <th className="text-right px-6 py-4 text-[11px] font-bold text-lo uppercase tracking-wider">Last 7 Trades</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line/50">
                                {MARKETS.map((m) => {
                                    const config = getMarketConfig(m.market)!
                                    const data = marketData.get(m.market)
                                    const ticker = data?.ticker ?? null
                                    const trades = data?.trades ?? []
                                    const pctNumeric = ticker ? parseFloat(ticker.priceChangePct24h) : 0

                                    return (
                                        <tr key={m.market} onClick={() => navigate(`/trade/${m.market}`)} className="group cursor-pointer hover:bg-raised transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-base border border-line flex items-center justify-center text-[14px] font-bold text-hi group-hover:border-mid transition-colors shadow-sm">
                                                        {m.market.slice(0, 1)}
                                                    </div>
                                                    <div>
                                                        <div className="text-[15px] font-bold text-hi">{m.displayName}</div>
                                                        <div className="text-[12px] font-mono text-lo mt-0.5">{m.market}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                {ticker?.lastPrice ? (
                                                    <span className="font-mono tabular-nums text-[15px] font-bold text-hi">
                                                        {formatPrice(ticker.lastPrice, config.priceScale)}
                                                    </span>
                                                ) : <span className="text-lo">-</span>}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <ChangeCell pct={ticker?.priceChangePct24h} />
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                {ticker?.volume24h ? (
                                                    <span className="font-mono tabular-nums text-[14px] font-medium text-mid">
                                                        {formatQty(ticker.volume24h, config.qtyScale)}
                                                    </span>
                                                ) : <span className="text-lo">-</span>}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex justify-end">
                                                    <Sparkline
                                                        trades={trades.slice(0, 30)}
                                                        positive={pctNumeric >= 0}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    )
}
