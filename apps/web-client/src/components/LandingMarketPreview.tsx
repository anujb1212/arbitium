import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { MARKETS } from '../types/market'
import { fetchTicker, TickerSnapshot } from '../lib/apiClient'
import { useMarketFeed } from '../ws/useMarketFeed'
import { WireEventEnvelope } from '../types/wire'
import { LandingMarketRow } from './LandingMarketRow'
import { LandingMarketPanel } from './LandingMarketPanel'

export type MarketData = { ticker: TickerSnapshot | null }

const PREVIEW_MARKETS = MARKETS.slice(0, 8)
const PREVIEW_MARKET_IDS = PREVIEW_MARKETS.map(m => m.market)
const BATCH_FLUSH_MS = 500

export function LandingMarketPreview(): React.JSX.Element {
    const [marketData, setMarketData] = useState<Map<string, MarketData>>(new Map())
    const [selectedMarketId, setSelectedMarketId] = useState<string>(PREVIEW_MARKETS[0].market)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const tradeBufferRef = useRef<Map<string, { price: string; qty: string; takerSide: string }[]>>(new Map())
    const flushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

    useEffect(() => {
        let isMounted = true
        setLoading(true)
        setError(false)
        Promise.all(
            PREVIEW_MARKETS.map(async (m): Promise<[string, MarketData]> => {
                const ticker = await fetchTicker(m.market).catch(() => null)
                return [m.market, { ticker }]
            })
        )
            .then((entries) => {
                if (isMounted) {
                    setMarketData(new Map(entries))
                    setLoading(false)
                }
            })
            .catch(() => {
                if (isMounted) {
                    setError(true)
                    setLoading(false)
                }
            })
        return () => { isMounted = false }
    }, [])

    useEffect(() => {
        flushTimerRef.current = setInterval(() => {
            const buffered = tradeBufferRef.current
            if (buffered.size === 0) return
            setMarketData(prev => {
                const next = new Map(prev)
                buffered.forEach((trades, market) => {
                    const current = next.get(market)
                    if (!current) return
                    const latestTrade = trades[trades.length - 1]
                    const updatedTicker = current.ticker ? {
                        ...current.ticker,
                        lastPrice: latestTrade.price
                    } : null
                    next.set(market, { ticker: updatedTicker })
                })
                return next
            })
            tradeBufferRef.current = new Map()
        }, BATCH_FLUSH_MS)

        return () => {
            if (flushTimerRef.current) clearInterval(flushTimerRef.current)
        }
    }, [])

    const handleEvent = useCallback((event: WireEventEnvelope) => {
        if (event.kind === "TRADE") {
            const buffer = tradeBufferRef.current
            const existing = buffer.get(event.market) ?? []
            existing.push({ price: event.payload.price, qty: event.payload.qty, takerSide: event.payload.takerSide })
            buffer.set(event.market, existing)
        }
    }, [])

    useMarketFeed(PREVIEW_MARKET_IDS, handleEvent)

    const handleSelect = useCallback((marketId: string) => {
        setSelectedMarketId(marketId)
    }, [])

    const selectedMarketConfig = useMemo(() => PREVIEW_MARKETS.find(m => m.market === selectedMarketId), [selectedMarketId])
    const selectedData = marketData.get(selectedMarketId)

    if (error) {
        return (
            <div className="w-full bg-panel border border-line rounded-xl shadow-2xl p-12 text-center flex flex-col items-center justify-center">
                <span className="text-lo font-medium mb-4">Live market data is temporarily unavailable.</span>
                <button onClick={() => window.location.reload()} className="text-[13px] font-bold bg-accent text-white hover:bg-accent/90 px-5 py-2 rounded-lg transition-colors">
                    Retry Connection
                </button>
            </div>
        )
    }

    return (
        <div className="w-full flex flex-col lg:flex-row gap-6 lg:gap-8 items-start justify-center relative">
            
            <div className="flex-1 w-full rounded-xl border border-line overflow-hidden bg-panel/80 backdrop-blur-xl shadow-2xl z-10 relative">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-panel border-b border-line">
                        <tr>
                            <th className="px-4 py-4 md:px-6 md:py-5 text-[10px] font-bold text-lo uppercase tracking-wider">Asset</th>
                            <th className="text-right px-4 py-4 md:px-6 md:py-5 text-[10px] font-bold text-lo uppercase tracking-wider">Price</th>
                            <th className="text-right px-4 py-4 md:px-6 md:py-5 text-[10px] font-bold text-lo uppercase tracking-wider">24h Change</th>
                            <th className="text-right px-4 py-4 md:px-6 md:py-5 text-[10px] font-bold text-lo uppercase tracking-wider hidden sm:table-cell">24h Volume</th>
                            <th className="text-right px-4 py-4 md:px-6 md:py-5 text-[10px] font-bold text-lo uppercase tracking-wider hidden md:table-cell">7d Trend</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-line/50">
                        {loading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <tr key={i} className="animate-pulse bg-raised/20">
                                    <td className="px-4 py-3 md:px-6 md:py-4"><div className="h-8 bg-line rounded-full w-24" /></td>
                                    <td className="px-4 py-3 md:px-6 md:py-4"><div className="h-5 bg-line rounded w-20 ml-auto" /></td>
                                    <td className="px-4 py-3 md:px-6 md:py-4"><div className="h-5 bg-line rounded w-16 ml-auto" /></td>
                                    <td className="px-4 py-3 md:px-6 md:py-4 hidden sm:table-cell"><div className="h-5 bg-line rounded w-16 ml-auto" /></td>
                                    <td className="px-4 py-3 md:px-6 md:py-4 hidden md:table-cell"><div className="h-8 bg-line rounded w-24 ml-auto" /></td>
                                </tr>
                            ))
                        ) : (
                            PREVIEW_MARKETS.map((m) => {
                                const data = marketData.get(m.market)
                                return (
                                    <LandingMarketRow
                                        key={m.market}
                                        market={m.market}
                                        displayName={m.displayName}
                                        ticker={data?.ticker ?? null}
                                        isSelected={selectedMarketId === m.market}
                                        onSelect={handleSelect}
                                    />
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="w-full lg:w-[320px] xl:w-[360px] flex-shrink-0 z-20 sticky top-24 lg:-ml-12 lg:mt-12 transition-all">
                {selectedMarketConfig && (
                    <LandingMarketPanel
                        market={selectedMarketConfig.market}
                        displayName={selectedMarketConfig.displayName}
                        ticker={selectedData?.ticker ?? null}
                    />
                )}
            </div>
        </div>
    )
}
