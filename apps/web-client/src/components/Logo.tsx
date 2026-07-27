import React, { useState } from 'react'

const LOGO_BASE = '/logos'

const TICKER_TO_FILE: Record<string, string> = {
  AAPL: 'APPL',
}

type Props = {
  market: string
  size?: number
  className?: string
}

export function Logo({ market, size = 32, className = '' }: Props): React.JSX.Element {
  const ticker = market.split('-')[0] ?? market
  const filename = TICKER_TO_FILE[ticker] ?? ticker
  const [imgError, setImgError] = useState(false)

  if (imgError) {
    const bgColor = market.length % 2 === 0 ? '#F7931A' : '#627EEA'
    return (
      <div
        className={`rounded-full flex items-center justify-center flex-shrink-0 ${className}`}
        style={{ width: size, height: size, backgroundColor: bgColor }}
      >
        <span className="font-bold text-white" style={{ fontSize: Math.max(10, size * 0.375) }}>
          {ticker.slice(0, 1)}
        </span>
      </div>
    )
  }

  return (
    <div
      className={`rounded-full overflow-hidden flex-shrink-0 bg-base border border-line ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={`${LOGO_BASE}/${filename}.png`}
        alt={ticker}
        className="w-full h-full object-contain p-[1px]"
        onError={() => setImgError(true)}
      />
    </div>
  )
}
