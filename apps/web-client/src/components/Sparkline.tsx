import React from 'react'
import type { SparklineCandle } from '../lib/apiClient'

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

export type SparklineProps = { candles: SparklineCandle[] | null; positive: boolean }

const Sparkline = React.memo(function Sparkline({ candles, positive }: SparklineProps): React.JSX.Element | null {
    const prices = candles?.map((c) => Number(c.close)) ?? []
    if (prices.length < 2) return (
        <div style={{ width: SPARK_W, height: SPARK_H }} className="flex items-center justify-center">
            <svg width={SPARK_W} height={SPARK_H} viewBox={`0 0 ${SPARK_W} ${SPARK_H}`} className="opacity-20">
                <line x1="12" y1={SPARK_H / 2} x2={SPARK_W - 12} y2={SPARK_H / 2} stroke="#6b7280" strokeWidth="1" strokeDasharray="3 3" />
            </svg>
        </div>
    )

    const path = buildSparkPath(prices)
    const color = positive ? '#00c278' : '#FF4D4F'
    const shadowColor = positive ? 'rgba(0, 194, 120, 0.4)' : 'rgba(255, 77, 79, 0.4)'

    return (
        <svg
            width={SPARK_W}
            height={SPARK_H}
            viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
            className="overflow-visible"
            style={{ filter: `drop-shadow(0px 6px 6px ${shadowColor})` }}
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
})

export { Sparkline }
