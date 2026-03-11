import React, { useEffect, useMemo, useRef } from 'react'
import {
    createChart, ColorType, CrosshairMode,
    type IChartApi, type ISeriesApi,
    type CandlestickData, type Time,
} from 'lightweight-charts'
import type { MarketConfig } from '../types/market'
import { formatPrice } from '../lib/format'
import type { TradeEntry } from '../hooks/useTradeFeed'
import { fetchKlines, type KlineBar } from '../lib/apiClient'

type Props = {
    trades: TradeEntry[]
    lastTradePrice: string | null
    config: MarketConfig
}

function toScaledPrice(rawPrice: string, priceScale: number): number {
    return Number(rawPrice) / Math.pow(10, priceScale)
}

function buildCandlesFromTrades(trades: TradeEntry[], priceScale: number): CandlestickData[] {
    const sorted = [...trades].sort((a, b) => a.timestamp - b.timestamp)
    const candles = new Map<number, CandlestickData>()

    for (const trade of sorted) {
        const minuteTs = Math.floor(trade.timestamp / 60_000) * 60 as Time
        const price = toScaledPrice(trade.price, priceScale)
        const existing = candles.get(Number(minuteTs))

        if (!existing) {
            candles.set(Number(minuteTs), {
                time: minuteTs,
                open: price,
                high: price,
                low: price,
                close: price,
            })
            continue
        }

        candles.set(Number(minuteTs), {
            ...existing,
            high: Math.max(existing.high, price),
            low: Math.min(existing.low, price),
            close: price,
        })
    }

    return Array.from(candles.values())
}

export function Chart({ trades, lastTradePrice, config }: Props): React.JSX.Element {
    const containerRef = useRef<HTMLDivElement>(null)
    const chartRef = useRef<IChartApi | null>(null)
    const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
    const hasSeededServerBarsRef = useRef(false)
    const lastCandleRef = useRef<CandlestickData | null>(null)

    const tradeCandles = useMemo(() => buildCandlesFromTrades(trades, config.priceScale), [trades, config.priceScale])

    useEffect(() => {
        if (!containerRef.current) return

        const chart = createChart(containerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: '#0f1117' },
                textColor: '#8892a4',
            },
            grid: {
                vertLines: { color: '#252d3d' },
                horzLines: { color: '#252d3d' },
            },
            crosshair: { mode: CrosshairMode.Normal },
            rightPriceScale: { borderColor: '#252d3d' },
            timeScale: { borderColor: '#252d3d', timeVisible: true, secondsVisible: false },
            width: containerRef.current.clientWidth || 800,
            height: containerRef.current.clientHeight || 400,
        })

        seriesRef.current = chart.addCandlestickSeries({
            upColor: '#22c55e', borderUpColor: '#22c55e', wickUpColor: '#22c55e',
            downColor: '#ef4444', borderDownColor: '#ef4444', wickDownColor: '#ef4444',
        })
        chartRef.current = chart

        const observer = new ResizeObserver(() => {
            if (containerRef.current) {
                chart.applyOptions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight,
                })
            }
        })
        observer.observe(containerRef.current)

        return () => {
            observer.disconnect()
            chart.remove()
            chartRef.current = null
            seriesRef.current = null
            hasSeededServerBarsRef.current = false
            lastCandleRef.current = null
        }
    }, [])

    useEffect(() => {
        const series = seriesRef.current
        if (!series) return

        let cancelled = false

        hasSeededServerBarsRef.current = false
        lastCandleRef.current = null
        series.setData([])

        const to = Date.now()
        const from = to - 24 * 60 * 60 * 1000

        fetchKlines({ market: config.market, interval: "ONE_MINUTE", from, to })
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
                    return
                }

                hasSeededServerBarsRef.current = false
                s.setData(tradeCandles)
                lastCandleRef.current = tradeCandles.at(-1) ?? null
            })
            .catch(console.error)

        return () => {
            cancelled = true
        }
    }, [config.market, config.priceScale])

    useEffect(() => {
        if (!seriesRef.current) return
        if (trades.length === 0) return
        if (!hasSeededServerBarsRef.current) {
            seriesRef.current.setData(tradeCandles)
            lastCandleRef.current = tradeCandles.at(-1) ?? null
            return
        }

        const latestTrade = trades[0]!
        const minuteTs = Math.floor(latestTrade.timestamp / 60_000) * 60 as Time
        const price = toScaledPrice(latestTrade.price, config.priceScale)
        const previous = lastCandleRef.current

        const nextCandle: CandlestickData =
            previous === null || previous.time !== minuteTs
                ? {
                    time: minuteTs,
                    open: price,
                    high: price,
                    low: price,
                    close: price,
                }
                : {
                    ...previous,
                    high: Math.max(previous.high, price),
                    low: Math.min(previous.low, price),
                    close: price,
                }

        seriesRef.current.update(nextCandle)
        lastCandleRef.current = nextCandle
    }, [trades, config.priceScale, tradeCandles])

    const displayPrice = lastTradePrice ? formatPrice(lastTradePrice, config.priceScale) : null

    return (
        <div className="flex flex-col flex-1 overflow-hidden min-h-0">
            <div className="flex items-center gap-4 px-4 py-2 border-b border-line flex-shrink-0">
                <span className="font-mono font-bold text-hi text-base">
                    {displayPrice ?? '--'}
                </span>
                <span className="font-mono text-xs text-lo">{config.market}</span>
                {trades.length === 0 && (
                    <span className="text-xs text-lo">Waiting for first trade...</span>
                )}
            </div>
            <div ref={containerRef} className="flex-1 w-full h-full min-h-0" />
        </div>
    )
}
