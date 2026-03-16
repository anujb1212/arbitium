import React, { useState, useId } from 'react'
import type { MarketConfig } from '../types/market'
import { placeLimitOrder, placeMarketOrder } from '../lib/apiClient'

type Side = 'BUY' | 'SELL'
type OrderType = 'LIMIT' | 'MARKET'
type Status =
    | { tag: 'idle' }
    | { tag: 'submitting' }
    | { tag: 'success'; commandId: string }
    | { tag: 'error'; message: string }

const inputCls =
    'w-full bg-base border border-line rounded-lg px-3 py-2.5 font-mono text-[13px] text-hi ' +
    'outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all placeholder:text-lo disabled:opacity-50'

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

function parseApiError(raw: string): string {
    try {
        const match = raw.match(/^\d+:\s*(.*)$/)
        const cleanStr = match ? match[1] : raw

        let msg = cleanStr
        try {
            const parsed = JSON.parse(cleanStr)
            msg = parsed.error || parsed.message || cleanStr
        } catch { }

        const lower = msg.toLowerCase()

        if (lower.includes('insufficient balance')) {
            const availMatch = msg.match(/available=(\d+)/)
            const reqMatch = msg.match(/required=(\d+)/)
            if (availMatch && reqMatch) {
                const avail = (Number(availMatch[1]) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })
                const req = (Number(reqMatch[1]) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })
                return `Insufficient balance. Required: ₹${req}, Available: ₹${avail}`
            }
            return "Insufficient funds to place this order."
        }

        if (lower.includes('insufficient holding')) {
            const availMatch = msg.match(/available=(\d+)/)
            const reqMatch = msg.match(/required=(\d+)/)
            if (availMatch && reqMatch) {
                return `Insufficient holdings. Required: ${reqMatch[1]}, Available: ${availMatch[1]}`
            }
            return "Insufficient holdings to place this order."
        }

        return msg.charAt(0).toUpperCase() + msg.slice(1)
    } catch {
        return raw
    }
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

    const canSubmit = !placing && qty !== '' && (orderType === 'MARKET' || price !== '')

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
            const message = parseApiError((err as Error).message)
            setStatus({ tag: 'error', message })
            onPlaceFailed?.({ orderId, message })
        }
    }

    return (
        <div className="px-5 py-5 bg-panel flex flex-col gap-6 h-full">
            <div className="flex bg-base p-1 rounded-lg border border-line">
                {(['LIMIT', 'MARKET'] as OrderType[]).map((t) => (
                    <button
                        key={t}
                        type="button"
                        onClick={() => { setOrderType(t); setStatus({ tag: 'idle' }) }}
                        className={`flex-1 py-1.5 text-[12px] font-semibold rounded-md transition-all active:scale-95
                            ${orderType === t ? 'bg-raised text-hi shadow-sm' : 'text-lo hover:text-mid'}`}
                    >
                        {t === 'LIMIT' ? 'Limit' : 'Market'}
                    </button>
                ))}
            </div>

            <div className="flex bg-base p-1 rounded-lg border border-line">
                {(['BUY', 'SELL'] as Side[]).map((s) => (
                    <button
                        key={s}
                        type="button"
                        onClick={() => setSide(s)}
                        className={`flex-1 py-1.5 text-[13px] font-bold rounded-md transition-all active:scale-95
                            ${side === s
                                ? s === 'BUY' ? 'bg-bull/20 text-bull shadow-sm' : 'bg-bear/20 text-bear shadow-sm'
                                : 'text-lo hover:text-mid'}`}
                    >
                        {s === 'BUY' ? 'Buy' : 'Sell'}
                    </button>
                ))}
            </div>

            <form onSubmit={handlePlace} className="flex flex-col gap-4">
                {orderType === 'LIMIT' && (
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor={priceId} className="text-[12px] font-medium text-mid flex justify-between">
                            <span>Price</span>
                            <span className="text-lo font-mono">{config.currency}</span>
                        </label>
                        <input
                            id={priceId}
                            className={inputCls}
                            type="text"
                            inputMode="decimal"
                            placeholder="0.00"
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
                    <div className="flex items-center justify-between px-3 py-3 bg-base rounded-lg border border-line">
                        <span className="text-[12px] font-medium text-mid">Est. Price</span>
                        <span className="font-mono tabular-nums text-[13px] text-hi font-bold">
                            {estimatedPrice
                                ? `₹${(Number(estimatedPrice) / Math.pow(10, config.priceScale)).toFixed(config.priceScale)}`
                                : '—'}
                        </span>
                    </div>
                )}

                <div className="flex flex-col gap-1.5">
                    <label htmlFor={qtyId} className="text-[12px] font-medium text-mid flex justify-between">
                        <span>Quantity</span>
                        <span className="text-lo font-mono">Shares</span>
                    </label>
                    <input
                        id={qtyId}
                        className={inputCls}
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={qty}
                        disabled={placing}
                        autoComplete="off"
                        onChange={(e) => setQty(e.target.value.replace(/\D/g, ''))}
                    />
                </div>

                {orderType === 'LIMIT' && price && qty && (
                    <div className="text-[12px] font-mono tabular-nums text-mid text-right mt-[-8px]">
                        ≈ ₹{(parseFloat(price) * parseInt(qty, 10)).toFixed(2)} total
                    </div>
                )}

                <div className="pt-2 flex flex-col gap-3">
                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className={`w-full py-3 rounded-lg text-[14px] font-bold transition-all
                            disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]
                            ${side === 'BUY' ? 'bg-bull text-base hover:bg-bull/90 shadow-sm' : 'bg-bear text-hi hover:bg-bear/90 shadow-sm'}`}
                    >
                        {placing ? 'Placing…' : `${side === 'BUY' ? 'Buy' : 'Sell'} ${config.market.split('_')[0]}`}
                    </button>

                    {status.tag === 'success' && (
                        <div className="flex items-center justify-center gap-2 text-[12px] font-mono font-bold text-bull mt-1 animate-in fade-in duration-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-bull animate-pulse" />
                            Accepted · {status.commandId.slice(0, 8)}
                        </div>
                    )}

                    {status.tag === 'error' && (
                        <div className="flex flex-col items-start gap-1 bg-bear/10 border border-bear/20 px-3 py-3 rounded-lg animate-in slide-in-from-top-2 fade-in duration-200">
                            <div className="flex items-start gap-2 text-[12px] font-mono text-bear">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 flex-shrink-0">
                                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                <p className="leading-snug break-words">{status.message}</p>
                            </div>
                        </div>
                    )}
                </div>
            </form>
        </div>
    )
}
