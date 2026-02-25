import React, { useEffect, useRef } from 'react'
import {
    createChart,
    ColorType,
    CrosshairMode,
    type IChartApi,
    type ISeriesApi,
    type CandlestickData,
    type Time,
} from 'lightweight-charts'

import type { MarketConfig } from '../types/market'
import { formatPrice } from '../lib/format'
import { TradeEntry } from '../hooks/useTradeFeed'

function buildCandles(trades: TradeEntry[], priceScale: number): CandlestickData[] {
    if (trades.length === 0) return []

    const bars = new Map<number, { open: number; high: number; low: number; close: number }>()

    for (const trade of [...trades].reverse()) {
        const price = Number(trade.price) / Math.pow(10, priceScale)
        const minuteTs = Math.floor(trade.timestamp / 60_000) * 60

        const bar = bars.get(minuteTs)
        if (!bar) {
            bars.set(minuteTs, { open: price, high: price, low: price, close: price })
        } else {
            bar.high = Math.max(bar.high, price)
            bar.low = Math.min(bar.low, price)
            bar.close = price
        }
    }

    return Array.from(bars.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([time, bar]) => ({ time: time as Time, ...bar }))
}

type Props = {
    trades: TradeEntry[]
    lastTradePrice: string | null
    config: MarketConfig
}

export function Chart({ trades, lastTradePrice, config }: Props): React.JSX.Element {
    const containerRef = useRef<HTMLDivElement>(null)
    const chartRef = useRef<IChartApi | null>(null)
    const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)

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
        }
    }, [])

    useEffect(() => {
        if (!seriesRef.current) return
        const candles = buildCandles(trades, config.priceScale)
        if (candles.length > 0) seriesRef.current.setData(candles)
    }, [trades, config.priceScale])

    const displayPrice = lastTradePrice
        ? formatPrice(lastTradePrice, config.priceScale)
        : null

    return (
        <div className="flex flex-col flex-1 overflow-hidden min-h-0">

            <div className="flex items-center gap-4 px-4 py-2 border-b border-line flex-shrink-0">
                <span className="font-mono font-bold text-hi text-base">
                    {displayPrice ?? '—'}
                </span>
                <span className="font-mono text-xs text-lo">{config.market}</span>
                {trades.length === 0 && (
                    <span className="text-xs text-lo">Waiting for first trade…</span>
                )}
            </div>
            <div ref={containerRef} className="flex-1 w-full h-full min-h-0" />
        </div>
    )
}
