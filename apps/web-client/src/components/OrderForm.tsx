import React, { useState, useId } from 'react'
import type { MarketConfig } from '../types/market'
import { formatPrice } from '../lib/format';
import { placeLimitOrder } from '../lib/apiClient';



type Side = 'BUY' | 'SELL'
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
    onPlaceSubmitted?: (draft: { orderId: string; side: Side; price: string; qty: string }) => void
    onPlaceAccepted?: (info: { orderId: string; commandId: string }) => void
    onPlaceFailed?: (info: { orderId: string; message: string }) => void
}

export function OrderForm({ config, onPlaceSubmitted, onPlaceAccepted, onPlaceFailed }: Props): React.JSX.Element {
    const priceId = useId()
    const qtyId = useId()

    const [side, setSide] = useState<Side>('BUY')
    const [price, setPrice] = useState('')
    const [qty, setQty] = useState('')

    const [placeStatus, setPlaceStatus] = useState<Status>({ tag: 'idle' })


    const placing = placeStatus.tag === 'submitting'
    const pricePreviewText = price ? `≈ ${formatPrice(price, config.priceScale)}` : '—'
    const pricePreviewColor = price ? 'text-mid' : 'text-lo/70'

    async function handlePlace(e: React.FormEvent): Promise<void> {
        e.preventDefault()
        if (!price || !qty) return

        const orderId = crypto.randomUUID()
        onPlaceSubmitted?.({ orderId, side, price, qty })

        setPlaceStatus({ tag: 'submitting' })
        try {
            const res = await placeLimitOrder({
                market: config.market,
                orderId,
                side,
                price,
                qty,
            })
            setPlaceStatus({ tag: 'success', commandId: res.commandId })
            onPlaceAccepted?.({ orderId, commandId: res.commandId })
            setPrice('')
            setQty('')
            setTimeout(() => setPlaceStatus({ tag: 'idle' }), 3000)
        } catch (err) {
            setPlaceStatus({ tag: 'error', message: (err as Error).message })
            const message = (err as Error).message
            setPlaceStatus({ tag: 'error', message })
            onPlaceFailed?.({ orderId, message })
        }
    }


    return (
        <div className="px-5 py-3.5 bg-panel">
            <form onSubmit={handlePlace} className="flex flex-col gap-2.5 max-w-[520px]">
                <div className="flex border border-line rounded-lg overflow-hidden">
                    {(['BUY', 'SELL'] as Side[]).map((s) => (
                        <button key={s} type="button" onClick={() => setSide(s)}
                            className={`flex-1 py-1.5 text-[13px] font-semibold transition-colors
                ${side === s
                                    ? s === 'BUY' ? 'bg-bull/15 text-bull' : 'bg-bear/15 text-bear'
                                    : 'bg-raised text-lo hover:text-mid'}`}>
                            {s === 'BUY' ? 'Buy' : 'Sell'}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2">
                    <div className="flex flex-col gap-1 flex-1">
                        <label htmlFor={priceId} className="text-[11px] text-lo">
                            Price <span className="text-lo/60">(paise)</span>
                        </label>
                        <input id={priceId} className={inputCls}
                            type="text" inputMode="numeric"
                            placeholder="e.g. 70000 = ₹700.00"
                            value={price} disabled={placing} autoComplete="off"
                            onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))} />
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                        <label htmlFor={qtyId} className="text-[11px] text-lo">
                            Qty <span className="text-lo/60">(shares)</span>
                        </label>
                        <input id={qtyId} className={inputCls}
                            type="text" inputMode="numeric"
                            placeholder="e.g. 10"
                            value={qty} disabled={placing} autoComplete="off"
                            onChange={(e) => setQty(e.target.value.replace(/\D/g, ''))} />
                    </div>
                </div>

                <div className={`text-[11px] font-mono ${pricePreviewColor}`}>
                    {pricePreviewText}
                </div>

                <button type="submit" disabled={placing || !price || !qty}
                    className={`py-2 rounded-lg text-[13px] font-semibold transition-colors
            disabled:opacity-40 disabled:cursor-not-allowed
            ${side === 'BUY'
                            ? 'bg-bull text-black hover:bg-bull/90'
                            : 'bg-bear text-white hover:bg-bear/90'}`}>
                    {placing ? 'Placing…' : `Place ${side} Order`}
                </button>


                {placeStatus.tag === 'success' && (
                    <p className="text-[11px] font-mono text-bull">
                        Accepted · {placeStatus.commandId.slice(0, 8)}…
                    </p>
                )}
                {placeStatus.tag === 'error' && (
                    <p className="text-[11px] font-mono text-bear break-all">
                        {placeStatus.message}
                    </p>
                )}
            </form>
        </div>
    )
}
