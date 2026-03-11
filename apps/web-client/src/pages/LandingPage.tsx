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
        <div style={{ width: SPARK_W, height: SPARK_H }}
            className="flex items-center justify-center">
            <span className="text-[10px] text-lo">—</span>
        </div>
    )

    const prices = trades.map((t) => Number(t.price))
    const path = buildSparkPath(prices)
    const color = positive ? '#10b981' : '#ef4444'

    return (
        <svg
            width={SPARK_W}
            height={SPARK_H}
            viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
            className="overflow-visible"
        >
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
    if (!pct) return <span className="text-lo font-mono text-[13px]">—</span>
    const numeric = parseFloat(pct)
    const color = numeric > 0 ? 'text-bull' : numeric < 0 ? 'text-bear' : 'text-mid'
    const prefix = numeric > 0 ? '+' : ''
    return (
        <span className={`font-mono text-[13px] font-medium ${color}`}>
            {prefix}{pct}%
        </span>
    )
}

type MarketData = {
    ticker: TickerSnapshot | null
    trades: RecentTrade[]
}

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
        <div className="min-h-screen bg-base text-hi font-sans selection:bg-accent/30">
            <header className="absolute top-0 w-full z-50 h-16 flex items-center justify-between px-8">
                <span className="text-[17px] font-bold tracking-tight text-hi">Arbitium</span>
                <nav className="flex items-center gap-6">
                    {loggedIn ? (
                        <button
                            onClick={() => { clearToken(); window.location.reload() }}
                            className="text-[13px] font-medium text-mid hover:text-hi transition-colors"
                        >
                            Sign out
                        </button>
                    ) : (
                        <button
                            onClick={redirectToVaultlyLogin}
                            className="text-[13px] font-medium text-hi bg-raised hover:bg-line border border-line px-4 py-1.5 rounded-full transition-colors"
                        >
                            Sign in with Vaultly
                        </button>
                    )}
                    <button
                        onClick={() => navigate(`/trade/${MARKETS[0].market}`)}
                        className="text-[13px] font-medium bg-accent hover:bg-accent/90 text-white px-4 py-1.5 rounded-full transition-colors"
                    >
                        Launch Trading
                    </button>
                </nav>
            </header>

            <main className="pt-40 pb-20 px-6 max-w-5xl mx-auto">
                {/* Hero */}
                <div className="text-center mb-20">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1] mb-6">
                        Exchange-grade precision.<br />
                        <span className="text-mid">Zero compromises.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-mid max-w-2xl mx-auto leading-relaxed mb-10">
                        A deterministic matching engine built from the ground up for Indian Equities.
                        Strict price-time priority.
                    </p>
                    <button
                        onClick={() => navigate(`/trade/${MARKETS[0].market}`)}
                        className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white
                            font-semibold text-[14px] px-6 py-2.5 rounded-full transition-colors"
                    >
                        Start Trading
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </button>
                </div>

                {/* Markets table */}
                <div>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <p className="text-[12px] font-semibold text-lo uppercase tracking-widest">
                            Markets
                        </p>
                        <span className="text-[11px] text-lo font-mono">{MARKETS.length} markets</span>
                    </div>

                    <div className="rounded-2xl border border-line overflow-hidden bg-panel">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-line">
                                    <th className="text-left px-6 py-3 text-[11px] font-medium text-lo uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="text-right px-6 py-3 text-[11px] font-medium text-lo uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="text-right px-6 py-3 text-[11px] font-medium text-lo uppercase tracking-wider">
                                        24h Change
                                    </th>
                                    <th className="text-right px-6 py-3 text-[11px] font-medium text-lo uppercase tracking-wider">
                                        24h Volume
                                    </th>
                                    <th className="text-right px-6 py-3 text-[11px] font-medium text-lo uppercase tracking-wider">
                                        Last 7 Trades
                                    </th>
                                    <th className="px-6 py-3" />
                                </tr>
                            </thead>
                            <tbody>
                                {MARKETS.map((m, idx) => {
                                    const config = getMarketConfig(m.market)!
                                    const data = marketData.get(m.market)
                                    const ticker = data?.ticker ?? null
                                    const trades = data?.trades ?? []
                                    const isLast = idx === MARKETS.length - 1

                                    const pctNumeric = ticker
                                        ? parseFloat(ticker.priceChangePct24h)
                                        : 0
                                    const priceColor = pctNumeric > 0
                                        ? 'text-bull'
                                        : pctNumeric < 0
                                            ? 'text-bear'
                                            : 'text-hi'

                                    return (
                                        <tr
                                            key={m.market}
                                            onClick={() => navigate(`/trade/${m.market}`)}
                                            className={`group cursor-pointer hover:bg-raised transition-colors
                                                ${!isLast ? 'border-b border-line' : ''}`}
                                        >
                                            {/* Name */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-base border border-line
                                                        flex items-center justify-center text-[13px] font-bold text-hi
                                                        group-hover:border-mid/50 transition-colors flex-shrink-0">
                                                        {m.market.slice(0, 1)}
                                                    </div>
                                                    <div>
                                                        <div className="text-[14px] font-semibold text-hi leading-tight">
                                                            {m.displayName}
                                                        </div>
                                                        <div className="text-[11px] font-mono text-lo mt-0.5">
                                                            {m.market}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Price*/}
                                            <td className="px-6 py-4 text-right">
                                                {ticker?.lastPrice ? (
                                                    <span className={`font-mono text-[14px] font-medium ${priceColor}`}>
                                                        {formatPrice(ticker.lastPrice, config.priceScale)}
                                                    </span>
                                                ) : (
                                                    <span className="text-lo font-mono text-[13px]">—</span>
                                                )}
                                            </td>

                                            {/* 24h Change */}
                                            <td className="px-6 py-4 text-right">
                                                <ChangeCell pct={ticker?.priceChangePct24h} />
                                            </td>

                                            {/* 24h Volume */}
                                            <td className="px-6 py-4 text-right">
                                                {ticker?.volume24h ? (
                                                    <span className="font-mono text-[13px] text-mid">
                                                        {formatQty(ticker.volume24h, config.qtyScale)}
                                                    </span>
                                                ) : (
                                                    <span className="text-lo font-mono text-[13px]">—</span>
                                                )}
                                            </td>

                                            {/* Sparkline */}
                                            <td className="px-6 py-4">
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
