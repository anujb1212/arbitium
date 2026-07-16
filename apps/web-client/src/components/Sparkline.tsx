import React from 'react'
import { RecentTrade } from '../lib/apiClient'

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

export type SparklineProps = { trades: RecentTrade[]; positive: boolean }

const Sparkline = React.memo(function Sparkline({ trades, positive }: SparklineProps): React.JSX.Element | null {
    if (trades.length < 2) return (
        <div style={{ width: SPARK_W, height: SPARK_H }} className="flex items-center justify-center">
            <span className="text-[10px] text-lo">-</span>
        </div>
    )

    const prices = trades.map((t) => Number(t.price))
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
