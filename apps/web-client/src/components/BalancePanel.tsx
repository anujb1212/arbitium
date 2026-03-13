import React, { useEffect, useState, useCallback } from 'react'
import { depositFunds, withdrawFunds, fetchTradingBalance } from '../lib/apiClient'

const inputCls =
    'w-full bg-base border border-line rounded px-2.5 py-1.5 font-mono text-xs text-hi ' +
    'outline-none focus:border-accent transition-colors placeholder:text-lo disabled:opacity-40'

type Tab = 'DEPOSIT' | 'WITHDRAW'
type Status =
    | { tag: 'idle' }
    | { tag: 'submitting' }
    | { tag: 'success'; message: string }
    | { tag: 'error'; message: string }

function rupeesToPaise(rupees: string): number {
    const val = parseFloat(rupees)
    if (!isFinite(val) || val <= 0) return 0
    return Math.round(val * 100)
}

export function BalancePanel(): React.JSX.Element {
    const [activeTab, setActiveTab] = useState<Tab>('DEPOSIT')
    const [amountRupees, setAmountRupees] = useState('')
    const [status, setStatus] = useState<Status>({ tag: 'idle' })
    const [availableBalance, setAvailableBalance] = useState<bigint | null>(null)
    const submitting = status.tag === 'submitting'

    const loadBalance = useCallback(async () => {
        try {
            const data = await fetchTradingBalance()
            setAvailableBalance(BigInt(data.available))
        } catch { /* silent */ }
    }, [])

    useEffect(() => { loadBalance() }, [loadBalance])

    async function handleSubmit(e: React.FormEvent): Promise<void> {
        e.preventDefault()
        const amountInPaise = rupeesToPaise(amountRupees)
        if (amountInPaise <= 0) return

        const idempotencyKey = crypto.randomUUID()
        setStatus({ tag: 'submitting' })

        try {
            if (activeTab === 'DEPOSIT') {
                await depositFunds({ amountInPaise: String(amountInPaise), idempotencyKey })
            } else {
                await withdrawFunds({ amountInPaise: String(amountInPaise), idempotencyKey })
            }
            const verb = activeTab === 'DEPOSIT' ? 'Deposited' : 'Withdrawn'
            setStatus({ tag: 'success', message: `${verb} ₹${parseFloat(amountRupees).toFixed(2)}` })
            setAmountRupees('')
            await loadBalance()
            setTimeout(() => setStatus({ tag: 'idle' }), 3000)
        } catch (err) {
            setStatus({ tag: 'error', message: (err as Error).message })
        }
    }

    const formattedBalance = availableBalance !== null
        ? `₹${(Number(availableBalance) / 100).toFixed(2)}`
        : '—'

    const presets = ['100', '500', '1000', '5000']

    return (
        <div className="px-4 py-3 bg-panel">

            <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] text-lo uppercase tracking-widest">Trading Balance</span>
                <span className="text-[14px] font-mono font-semibold text-hi">{formattedBalance}</span>
            </div>

            <div className="flex border border-line rounded-lg overflow-hidden mb-3">
                {(['DEPOSIT', 'WITHDRAW'] as Tab[]).map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => { setActiveTab(tab); setStatus({ tag: 'idle' }) }}
                        className={`flex-1 py-1.5 text-[12px] font-semibold transition-colors
                            ${activeTab === tab
                                ? 'bg-accent/15 text-accent'
                                : 'bg-raised text-lo hover:text-mid'}`}
                    >
                        {tab === 'DEPOSIT' ? 'Deposit' : 'Withdraw'}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-mid font-mono">₹</span>
                    <input
                        className={`${inputCls} pl-6`}
                        type="text"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={amountRupees}
                        disabled={submitting}
                        autoComplete="off"
                        onChange={(e) => {
                            const v = e.target.value
                            if (/^\d*\.?\d{0,2}$/.test(v)) setAmountRupees(v)
                        }}
                    />
                </div>

                <div className="flex gap-1.5">
                    {presets.map((p) => (
                        <button
                            key={p}
                            type="button"
                            disabled={submitting}
                            onClick={() => setAmountRupees(p)}
                            className="flex-1 py-1 rounded text-[10px] font-mono text-lo
                                bg-raised hover:bg-line hover:text-mid transition-colors
                                disabled:opacity-40"
                        >
                            ₹{p}
                        </button>
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={submitting || rupeesToPaise(amountRupees) <= 0}
                    className="py-2 rounded-lg text-[13px] font-semibold transition-colors
                        disabled:opacity-40 disabled:cursor-not-allowed
                        bg-accent/15 text-accent hover:bg-accent/25"
                >
                    {submitting
                        ? `${activeTab === 'DEPOSIT' ? 'Depositing' : 'Withdrawing'}…`
                        : activeTab === 'DEPOSIT' ? 'Deposit from Vaultly' : 'Withdraw to Vaultly'}
                </button>

                {status.tag === 'success' && (
                    <p className="text-[11px] font-mono text-bull">{status.message}</p>
                )}
                {status.tag === 'error' && (
                    <p className="text-[11px] font-mono text-bear break-all">{status.message}</p>
                )}
            </form>
        </div>
    )
}
