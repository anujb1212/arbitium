import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
    createChart, ColorType, CrosshairMode,
    type IChartApi, type ISeriesApi,
    type CandlestickData, type Time,
} from 'lightweight-charts'
import type { MarketConfig } from '../types/market'
import { formatPrice } from '../lib/format'
import type { TradeEntry } from '../hooks/useTradeFeed'
import { fetchKlines, type KlineBar } from '../lib/apiClient'

type Props = { trades: TradeEntry[]; lastTradePrice: string | null; config: MarketConfig }
type IntervalOption = { label: string; apiValue: string; minutes: number }

const INTERVAL_GROUPS = [
    {
        name: 'Minutes',
        options: [
            { label: '1m', apiValue: 'ONE_MINUTE', minutes: 1 },
            { label: '15m', apiValue: 'FIFTEEN_MINUTES', minutes: 15 },
        ]
    },
    {
        name: 'Hours',
        options: [
            { label: '1H', apiValue: 'ONE_HOUR', minutes: 60 },
            { label: '4H', apiValue: 'FOUR_HOURS', minutes: 240 },
        ]
    },
    {
        name: 'Days',
        options: [
            { label: '1D', apiValue: 'ONE_DAY', minutes: 1440 },
            { label: '1W', apiValue: 'ONE_WEEK', minutes: 10080 },
        ]
    }
]

const QUICK_INTERVALS = [
    INTERVAL_GROUPS[0].options[1], // 15m
    INTERVAL_GROUPS[1].options[0], // 1H
    INTERVAL_GROUPS[1].options[1], // 4H
    INTERVAL_GROUPS[2].options[0], // 1D
]

function toScaledPrice(rawPrice: string, priceScale: number): number {
    return Number(rawPrice) / Math.pow(10, priceScale)
}

function buildCandlesFromTrades(trades: TradeEntry[], priceScale: number, intervalMinutes: number): CandlestickData[] {
    const sorted = [...trades].sort((a, b) => a.timestamp - b.timestamp)
    const candles = new Map<number, CandlestickData>()
    const msPerInterval = intervalMinutes * 60_000

    for (const trade of sorted) {
        const intervalTs = Math.floor(trade.timestamp / msPerInterval) * (intervalMinutes * 60) as Time
        const price = toScaledPrice(trade.price, priceScale)
        const existing = candles.get(Number(intervalTs))

        if (!existing) {
            candles.set(Number(intervalTs), { time: intervalTs, open: price, high: price, low: price, close: price })
        } else {
            candles.set(Number(intervalTs), {
                ...existing,
                high: Math.max(existing.high, price),
                low: Math.min(existing.low, price),
                close: price,
            })
        }
    }
    return Array.from(candles.values())
}

export function Chart({ trades, lastTradePrice, config }: Props): React.JSX.Element {
    const containerRef = useRef<HTMLDivElement>(null)
    const chartRef = useRef<IChartApi | null>(null)
    const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const hasSeededServerBarsRef = useRef(false)
    const lastCandleRef = useRef<CandlestickData | null>(null)

    const [selectedInterval, setSelectedInterval] = useState<IntervalOption>(QUICK_INTERVALS[0]!)
    const [dropdownOpen, setDropdownOpen] = useState(false)

    const tradeCandles = useMemo(
        () => buildCandlesFromTrades(trades, config.priceScale, selectedInterval.minutes),
        [trades, config.priceScale, selectedInterval.minutes]
    )

    useEffect(() => {
        function onOutside(e: MouseEvent): void { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false) }
        document.addEventListener("mousedown", onOutside)
        return () => document.removeEventListener("mousedown", onOutside)
    }, [])

    useEffect(() => {
        if (!containerRef.current) return

        const chart = createChart(containerRef.current, {
            layout: { background: { type: ColorType.Solid, color: '#0e1015' }, textColor: '#6b7280' },
            grid: { vertLines: { color: '#282a36' }, horzLines: { color: '#282a36' } },
            crosshair: { mode: CrosshairMode.Normal, vertLine: { color: '#6b7280' }, horzLine: { color: '#6b7280' } },
            rightPriceScale: { borderColor: '#282a36' },
            timeScale: {
                borderColor: '#282a36',
                timeVisible: true,
                secondsVisible: false
            },
            width: containerRef.current.clientWidth || 800,
            height: containerRef.current.clientHeight || 400,
        })

        seriesRef.current = chart.addCandlestickSeries({
            upColor: '#00c278', borderUpColor: '#00c278', wickUpColor: '#00c278',
            downColor: '#ff3b69', borderDownColor: '#ff3b69', wickDownColor: '#ff3b69',
        })
        chartRef.current = chart

        const observer = new ResizeObserver(() => {
            if (containerRef.current) {
                chart.applyOptions({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight })
            }
        })
        observer.observe(containerRef.current)

        return () => {
            observer.disconnect(); chart.remove(); chartRef.current = null; seriesRef.current = null;
            hasSeededServerBarsRef.current = false; lastCandleRef.current = null;
        }
    }, [])

    useEffect(() => {
        const series = seriesRef.current
        const chart = chartRef.current
        if (!series || !chart) return

        chart.applyOptions({
            timeScale: { timeVisible: selectedInterval.minutes < 1440 }
        })

        let cancelled = false
        hasSeededServerBarsRef.current = false
        lastCandleRef.current = null
        series.setData([])

        const to = Date.now()
        const from = to - (selectedInterval.minutes * 60_000 * 1500)

        fetchKlines({ market: config.market, interval: selectedInterval.apiValue, from, to })
            .then((bars: KlineBar[]) => {
                if (cancelled) return
                const s = seriesRef.current
                if (!s) return

                if (bars.length > 0) {
                    const candleData: CandlestickData[] = bars.map((b) => ({
                        time: Math.floor(b.openTime / 1000) as Time,
                        open: Number(b.open) / Math.pow(10, config.priceScale),
                        high: Number(b.high) / Math.pow(10, config.priceScale),
                        low: Number(b.low) / Math.pow(10, config.priceScale),
                        close: Number(b.close) / Math.pow(10, config.priceScale),
                    }))
                    s.setData(candleData)
                    hasSeededServerBarsRef.current = true
                    lastCandleRef.current = candleData.at(-1) ?? null
                } else {
                    s.setData(tradeCandles)
                    lastCandleRef.current = tradeCandles.at(-1) ?? null
                }
            })
            .catch((err) => console.error("Chart Fetch Error:", err))

        return () => { cancelled = true }
    }, [config.market, config.priceScale, selectedInterval, tradeCandles])

    useEffect(() => {
        if (!seriesRef.current || trades.length === 0) return

        const latestTrade = trades[0]!
        const msPerInterval = selectedInterval.minutes * 60_000
        const intervalTs = Math.floor(latestTrade.timestamp / msPerInterval) * (selectedInterval.minutes * 60) as Time
        const price = toScaledPrice(latestTrade.price, config.priceScale)
        const previous = lastCandleRef.current

        const nextCandle: CandlestickData = previous === null || previous.time !== intervalTs
            ? { time: intervalTs, open: price, high: price, low: price, close: price }
            : { ...previous, high: Math.max(previous.high, price), low: Math.min(previous.low, price), close: price }

        seriesRef.current.update(nextCandle)
        lastCandleRef.current = nextCandle
    }, [trades, config.priceScale, selectedInterval])

    const displayPrice = lastTradePrice ? formatPrice(lastTradePrice, config.priceScale) : null

    return (
        <div className="flex flex-col h-full overflow-hidden bg-base relative">
            <div className="flex items-center justify-between px-5 h-12 border-b border-line flex-shrink-0 z-10">
                <div className="flex items-center gap-4">
                    <span className="font-mono tabular-nums font-bold text-hi text-[16px]">
                        {displayPrice ?? '-'}
                    </span>
                    <div className="w-px h-5 bg-line" />

                    <div className="flex items-center gap-0.5 bg-panel p-1 rounded-lg border border-line">
                        {QUICK_INTERVALS.map((opt) => (
                            <button
                                key={opt.apiValue}
                                onClick={() => setSelectedInterval(opt)}
                                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all active:scale-[0.98]
                                    ${selectedInterval.apiValue === opt.apiValue
                                        ? 'bg-raised text-hi shadow-sm'
                                        : 'text-lo hover:text-hi hover:bg-base'}`}
                            >
                                {opt.label}
                            </button>
                        ))}

                        <div className="w-px h-3 bg-line mx-1" />

                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold transition-all
                                    ${!QUICK_INTERVALS.find(q => q.apiValue === selectedInterval.apiValue)
                                        ? 'text-hi bg-raised'
                                        : 'text-lo hover:text-hi hover:bg-base'}`}
                            >
                                <span>
                                    {!QUICK_INTERVALS.find(q => q.apiValue === selectedInterval.apiValue)
                                        ? selectedInterval.label
                                        : 'More'}
                                </span>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </button>

                            {dropdownOpen && (
                                <div className="absolute top-[120%] left-0 w-44 bg-panel border border-line rounded-lg shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150 origin-top-left">
                                    {INTERVAL_GROUPS.map((group, idx) => (
                                        <div key={group.name} className={`${idx !== 0 ? 'mt-2 pt-2 border-t border-line/50' : ''}`}>
                                            <span className="text-[10px] font-bold text-lo uppercase tracking-wider px-2 mb-1 block">
                                                {group.name}
                                            </span>
                                            <div className="grid grid-cols-3 gap-1">
                                                {group.options.map(opt => (
                                                    <button
                                                        key={opt.apiValue}
                                                        onClick={() => { setSelectedInterval(opt); setDropdownOpen(false) }}
                                                        className={`py-1.5 rounded text-[11px] font-bold transition-colors
                                                            ${selectedInterval.apiValue === opt.apiValue
                                                                ? 'bg-raised text-hi'
                                                                : 'text-mid hover:bg-base hover:text-hi'}`}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div ref={containerRef} className="flex-1 w-full min-h-0 relative z-0" />
        </div>
    )
}
