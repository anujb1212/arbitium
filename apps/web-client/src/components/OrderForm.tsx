import React, { useState, useId } from 'react'
import type { MarketConfig } from '../types/market'
import { placeLimitOrder, placeMarketOrder } from '../lib/apiClient'
import { Eye, Plus, Minus, Download, Upload } from 'lucide-react'

type Side = 'BUY' | 'SELL'
type OrderType = 'LIMIT' | 'MARKET'
type Status =
    | { tag: 'idle' }
    | { tag: 'submitting' }
    | { tag: 'success'; commandId: string }
    | { tag: 'error'; message: string }

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
    const [orderType, setOrderType] = useState<OrderType>('LIMIT')
    const [side, setSide] = useState<Side>('BUY')
    const [price, setPrice] = useState('')
    const [qty, setQty] = useState('')
    const [status, setStatus] = useState<Status>({ tag: 'idle' })

    const placing = status.tag === 'submitting'

    const estimatedPrice = orderType === 'MARKET'
        ? (side === 'BUY' ? bestAskPrice : bestBidPrice) ?? null
        : null

    const canSubmit = !placing && qty !== '' && qty !== '0' && (orderType === 'MARKET' || price !== '')

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
            setTimeout(() => setStatus({ tag: 'idle' }), 3000)
        } catch (err) {
            const message = parseApiError((err as Error).message)
            setStatus({ tag: 'error', message })
            onPlaceFailed?.({ orderId, message })
        }
    }

    const orderValue = parseFloat(price || '0') * parseInt(qty || '0', 10)

    return (
        <div className="flex flex-col h-full bg-panel">
            
            <form onSubmit={handlePlace} className="p-4 flex flex-col gap-5 border-b border-line pb-6">
                
                {/* Buy/Sell Toggles */}
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setSide('BUY')}
                        className={`flex-1 py-2.5 text-[12px] font-bold rounded-[4px] transition-all
                            ${side === 'BUY' ? 'bg-[#188B52] text-white shadow-sm' : 'bg-base border border-line text-lo hover:text-hi'}`}
                    >
                        BUY
                    </button>
                    <button
                        type="button"
                        onClick={() => setSide('SELL')}
                        className={`flex-1 py-2.5 text-[12px] font-bold rounded-[4px] transition-all
                            ${side === 'SELL' ? 'bg-bear text-white shadow-sm' : 'bg-base border border-line text-lo hover:text-hi'}`}
                    >
                        SELL
                    </button>
                </div>

                {/* Limit/Market Toggles */}
                <div className="flex bg-base rounded-[4px] p-1 border border-line">
                    <button
                        type="button"
                        onClick={() => { setOrderType('LIMIT'); setStatus({ tag: 'idle' }) }}
                        className={`flex-1 py-1.5 text-[11px] font-bold rounded-[3px] transition-all tracking-wider
                            ${orderType === 'LIMIT' ? 'bg-panel text-hi shadow-sm' : 'text-lo hover:text-mid'}`}
                    >
                        LIMIT
                    </button>
                    <button
                        type="button"
                        onClick={() => { setOrderType('MARKET'); setStatus({ tag: 'idle' }) }}
                        className={`flex-1 py-1.5 text-[11px] font-bold rounded-[3px] transition-all tracking-wider
                            ${orderType === 'MARKET' ? 'bg-panel text-hi shadow-sm' : 'text-lo hover:text-mid'}`}
                    >
                        MARKET
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    {orderType === 'LIMIT' && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-medium text-lo">
                                Price ({config.currency})
                            </label>
                            <div className="relative flex items-center bg-base border border-line rounded-[4px] overflow-hidden focus-within:border-mid transition-colors">
                                <input
                                    className="w-full bg-transparent px-3 py-2.5 font-mono text-[13px] font-bold text-hi outline-none"
                                    type="text"
                                    inputMode="decimal"
                                    value={price}
                                    disabled={placing}
                                    onChange={(e) => {
                                        if (/^\d*\.?\d*$/.test(e.target.value)) setPrice(e.target.value)
                                    }}
                                />
                                <div className="flex items-center self-stretch border-l border-line">
                                    <button type="button" className="px-3 hover:bg-raised text-lo hover:text-hi transition-colors border-r border-line" onClick={() => setPrice(p => (parseFloat(p || '0') - 0.05).toFixed(2))}><Minus size={14} /></button>
                                    <button type="button" className="px-3 hover:bg-raised text-lo hover:text-hi transition-colors" onClick={() => setPrice(p => (parseFloat(p || '0') + 0.05).toFixed(2))}><Plus size={14} /></button>
                                </div>
                            </div>
                        </div>
                    )}

                    {orderType === 'MARKET' && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-medium text-lo">
                                Est. Price ({config.currency})
                            </label>
                            <div className="flex items-center px-3 py-2.5 bg-base border border-line rounded-[4px]">
                                <span className="font-mono tabular-nums text-[13px] font-bold text-hi">
                                    {estimatedPrice ? `₹${(Number(estimatedPrice) / Math.pow(10, config.priceScale)).toFixed(config.priceScale)}` : 'Market Price'}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-medium text-lo">
                            Quantity (Shares)
                        </label>
                        <div className="relative flex items-center bg-base border border-line rounded-[4px] overflow-hidden focus-within:border-mid transition-colors">
                            <input
                                className="w-full bg-transparent px-3 py-2.5 font-mono text-[13px] font-bold text-hi outline-none"
                                type="text"
                                inputMode="numeric"
                                value={qty}
                                disabled={placing}
                                onChange={(e) => setQty(e.target.value.replace(/\D/g, ''))}
                            />
                            <div className="flex items-center self-stretch border-l border-line">
                                <button type="button" className="px-3 hover:bg-raised text-lo hover:text-hi transition-colors border-r border-line" onClick={() => setQty(q => Math.max(0, parseInt(q || '0') - 1).toString())}><Minus size={14} /></button>
                                <button type="button" className="px-3 hover:bg-raised text-lo hover:text-hi transition-colors" onClick={() => setQty(q => (parseInt(q || '0') + 1).toString())}><Plus size={14} /></button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-[11px] mt-1">
                        <span className="text-lo font-medium">Order Value</span>
                        <span className="text-lo font-mono">₹{orderValue.toFixed(2)}</span>
                    </div>

                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className={`w-full py-3.5 mt-2 rounded-[4px] text-[13px] font-bold transition-all uppercase tracking-wide
                            disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]
                            ${side === 'BUY'
                                ? 'bg-[#188B52] text-white hover:bg-[#157a48]'
                                : 'bg-bear text-white hover:bg-[#ff2a5f]'}`}
                    >
                        {placing ? 'Placing…' : `PLACE ${side} ORDER`}
                    </button>

                    {status.tag === 'success' && (
                        <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono font-bold text-bull animate-in fade-in duration-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-bull animate-pulse" />
                            Accepted · {status.commandId.slice(0, 8)}
                        </div>
                    )}

                    {status.tag === 'error' && (
                        <div className="flex flex-col items-start gap-1 bg-bear/10 border border-bear/20 px-2 py-2 rounded-[4px] animate-in slide-in-from-top-2 fade-in duration-200">
                            <div className="flex items-start gap-1.5 text-[11px] font-mono text-bear">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 flex-shrink-0">
                                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                <p className="leading-snug break-words">{status.message}</p>
                            </div>
                        </div>
                    )}
                </div>
            </form>

            <div className="p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between text-[11px] font-bold text-hi tracking-widest uppercase">
                    <span>BALANCE</span>
                    <Eye className="w-3.5 h-3.5 text-lo hover:text-hi cursor-pointer transition-colors" />
                </div>
                
                <div className="flex flex-col gap-2.5">
                    <div className="flex justify-between items-center text-[11px]">
                        <span className="text-lo font-medium">Available Balance</span>
                        <span className="font-mono text-hi font-medium">-</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                        <span className="text-lo font-medium">Used Balance</span>
                        <span className="font-mono text-hi font-medium">-</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] pt-1 mt-1 border-t border-line border-dashed">
                        <span className="text-lo font-medium">Total Balance</span>
                        <span className="font-mono text-hi font-medium">-</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                        <span className="text-lo font-medium">Buying Power</span>
                        <span className="font-mono text-hi font-medium">-</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2">
                    <button className="flex items-center justify-center gap-2 py-2.5 border border-line rounded-[4px] text-[11px] font-bold text-hi hover:bg-raised transition-colors active:scale-[0.98]">
                        <Download className="w-3.5 h-3.5 text-lo" /> DEPOSIT
                    </button>
                    <button className="flex items-center justify-center gap-2 py-2.5 border border-line rounded-[4px] text-[11px] font-bold text-hi hover:bg-raised transition-colors active:scale-[0.98]">
                        <Upload className="w-3.5 h-3.5 text-lo" /> WITHDRAW
                    </button>
                </div>
            </div>

        </div>
    )
}