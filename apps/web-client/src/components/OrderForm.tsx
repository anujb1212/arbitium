import React, { useState, useId, useEffect, useCallback } from 'react'
import type { MarketConfig } from '../types/market'
import { placeLimitOrder, placeMarketOrder, fetchTradingBalance } from '../lib/apiClient'

type Side = 'BUY' | 'SELL'
type OrderType = 'LIMIT' | 'MARKET'
type Status =
    | { tag: 'idle' }
    | { tag: 'submitting' }
    | { tag: 'success'; commandId: string }
    | { tag: 'error'; message: string }

const inputCls =
    'w-full bg-base border border-line rounded px-2.5 py-1.5 font-mono text-xs text-hi ' +
    'outline-none focus:border-accent transition-colors placeholder:text-lo disabled:opacity-40'

type Props = {
    config: MarketConfig
    bestBidPrice?: string | null
    bestAskPrice?: string | null
    onPlaceSubmitted?: (draft: { orderId: string; side: Side; price: string; qty: string }) => void
    onPlaceAccepted?: (info: { orderId: string; commandId: string }) => void
    onPlaceFailed?: (info: { orderId: string; message: string }) => void
}

function toFixedPoint(humanPrice: string, scale: number): string {
    const [intPart = "0", fracPart = ""] = humanPrice.split(".")
    const paddedFrac = fracPart.slice(0, scale).padEnd(scale, "0")
    return String(BigInt(`${intPart}${paddedFrac}`))
}

export function OrderForm({
    config, bestBidPrice, bestAskPrice,
    onPlaceSubmitted, onPlaceAccepted, onPlaceFailed
}: Props): React.JSX.Element {
    const priceId = useId()
    const qtyId = useId()

    const [orderType, setOrderType] = useState<OrderType>('LIMIT')
    const [side, setSide] = useState<Side>('BUY')
    const [price, setPrice] = useState('')
    const [qty, setQty] = useState('')
    const [status, setStatus] = useState<Status>({ tag: 'idle' })

    const placing = status.tag === 'submitting'

    const estimatedPrice = orderType === 'MARKET'
        ? (side === 'BUY' ? bestAskPrice : bestBidPrice) ?? null
        : null

    const canSubmit = placing === false && qty !== '' &&
        (orderType === 'MARKET' || price !== '')

    async function handlePlace(e: React.FormEvent): Promise<void> {
        e.preventDefault()
        if (!canSubmit) return

        const orderId = crypto.randomUUID()
        setStatus({ tag: 'submitting' })

        try {
            if (orderType === 'LIMIT') {
                const priceInFixed = toFixedPoint(price, config.priceScale)
                onPlaceSubmitted?.({ orderId, side, price: priceInFixed, qty })
                const res = await placeLimitOrder({
                    market: config.market, orderId, side,
                    price: priceInFixed, qty,
                })
                setStatus({ tag: 'success', commandId: res.commandId })
                onPlaceAccepted?.({ orderId, commandId: res.commandId })
            } else {
                const res = await placeMarketOrder({
                    market: config.market, orderId, side, qty,
                })
                setStatus({ tag: 'success', commandId: res.commandId })
                onPlaceAccepted?.({ orderId, commandId: res.commandId })
            }
            setPrice('')
            setQty('')
            setTimeout(() => setStatus({ tag: 'idle' }), 3000)
        } catch (err) {
            const message = (err as Error).message
            setStatus({ tag: 'error', message })
            onPlaceFailed?.({ orderId, message })
        }
    }

    return (
        <div className="px-4 py-3 bg-panel flex flex-col gap-3">

            <div className="flex border border-line rounded-lg overflow-hidden">
                {(['LIMIT', 'MARKET'] as OrderType[]).map((t) => (
                    <button
                        key={t}
                        type="button"
                        onClick={() => { setOrderType(t); setStatus({ tag: 'idle' }) }}
                        className={`flex-1 py-1.5 text-[12px] font-semibold transition-colors
                            ${orderType === t
                                ? 'bg-accent/15 text-accent'
                                : 'bg-raised text-lo hover:text-mid'}`}
                    >
                        {t === 'LIMIT' ? 'Limit' : 'Market'}
                    </button>
                ))}
            </div>

            <div className="flex border border-line rounded-lg overflow-hidden">
                {(['BUY', 'SELL'] as Side[]).map((s) => (
                    <button
                        key={s}
                        type="button"
                        onClick={() => setSide(s)}
                        className={`flex-1 py-1.5 text-[13px] font-bold transition-colors
                            ${side === s
                                ? s === 'BUY' ? 'bg-bull/15 text-bull' : 'bg-bear/15 text-bear'
                                : 'bg-raised text-lo hover:text-mid'}`}
                    >
                        {s === 'BUY' ? 'Buy' : 'Sell'}
                    </button>
                ))}
            </div>

            <form onSubmit={handlePlace} className="flex flex-col gap-2.5">
                {orderType === 'LIMIT' && (
                    <div className="flex flex-col gap-1">
                        <label htmlFor={priceId} className="text-[11px] text-lo">
                            Price <span className="text-lo/50">({config.currency})</span>
                        </label>
                        <input
                            id={priceId}
                            className={inputCls}
                            type="text"
                            inputMode="decimal"
                            placeholder="e.g. 100.00"
                            value={price}
                            disabled={placing}
                            autoComplete="off"
                            onChange={(e) => {
                                if (/^\d*\.?\d*$/.test(e.target.value)) setPrice(e.target.value)
                            }}
                        />
                    </div>
                )}

                {orderType === 'MARKET' && (
                    <div className="flex items-center justify-between px-2.5 py-1.5 bg-raised
                        rounded border border-line">
                        <span className="text-[11px] text-lo">Est. Price</span>
                        <span className="font-mono text-[12px] text-mid">
                            {estimatedPrice
                                ? `₹${(Number(estimatedPrice) / Math.pow(10, config.priceScale)).toFixed(config.priceScale)}`
                                : '—'}
                        </span>
                    </div>
                )}

                <div className="flex flex-col gap-1">
                    <label htmlFor={qtyId} className="text-[11px] text-lo">
                        Qty <span className="text-lo/50">(shares)</span>
                    </label>
                    <input
                        id={qtyId}
                        className={inputCls}
                        type="text"
                        inputMode="numeric"
                        placeholder="e.g. 10"
                        value={qty}
                        disabled={placing}
                        autoComplete="off"
                        onChange={(e) => setQty(e.target.value.replace(/\D/g, ''))}
                    />
                </div>

                {orderType === 'LIMIT' && price && qty && (
                    <div className="text-[11px] font-mono text-mid">
                        ≈ ₹{(parseFloat(price) * parseInt(qty, 10)).toFixed(2)} total
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!canSubmit}
                    className={`py-2 rounded-lg text-[13px] font-bold transition-colors
                        disabled:opacity-40 disabled:cursor-not-allowed
                        ${side === 'BUY'
                            ? 'bg-bull text-black hover:bg-bull/90'
                            : 'bg-bear text-white hover:bg-bear/90'}`}
                >
                    {placing
                        ? 'Placing…'
                        : `${side === 'BUY' ? 'Buy' : 'Sell'} ${orderType === 'LIMIT' ? 'Limit' : 'Market'}`}
                </button>

                {status.tag === 'success' && (
                    <p className="text-[11px] font-mono text-bull">
                        ✓ Accepted · {status.commandId.slice(0, 8)}…
                    </p>
                )}
                {status.tag === 'error' && (
                    <p className="text-[11px] font-mono text-bear break-all">
                        {status.message}
                    </p>
                )}
            </form>
        </div>
    )
}

