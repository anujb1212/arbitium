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

export function BalancePanel(): React.JSX.Element {
    const [activeTab, setActiveTab] = useState<Tab>('DEPOSIT')
    const [amount, setAmount] = useState('')
    const [status, setStatus] = useState<Status>({ tag: 'idle' })
    const [availableBalance, setAvailableBalance] = useState<bigint | null>(null)

    const submitting = status.tag === 'submitting'

    const loadBalance = useCallback(async () => {
        try {
            const data = await fetchTradingBalance()
            setAvailableBalance(BigInt(data.available))
        } catch {
            // silently fail
        }
    }, [])

    useEffect(() => {
        loadBalance()
    }, [loadBalance])

    async function handleSubmit(e: React.FormEvent): Promise<void> {
        e.preventDefault()
        if (!amount) return

        const idempotencyKey = crypto.randomUUID()
        setStatus({ tag: 'submitting' })

        try {
            if (activeTab === 'DEPOSIT') {
                await depositFunds({ amountInPaise: amount, idempotencyKey })
            } else {
                await withdrawFunds({ amountInPaise: amount, idempotencyKey })
            }
            setStatus({ tag: 'success', message: `${activeTab === 'DEPOSIT' ? 'Deposited' : 'Withdrawn'} ₹${(Number(amount) / 100).toFixed(2)}` })
            setAmount('')
            await loadBalance()
            setTimeout(() => setStatus({ tag: 'idle' }), 3000)
        } catch (err) {
            setStatus({ tag: 'error', message: (err as Error).message })
        }
    }

    const formattedBalance = availableBalance !== null
        ? `₹${(Number(availableBalance) / 100).toFixed(2)}`
        : '—'

    return (
        <div className="px-5 py-3.5 bg-panel border-t border-line sticky bottom-0">
            <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] text-lo uppercase tracking-widest">Trading Balance</span>
                <span className="text-[13px] font-mono text-hi">{formattedBalance}</span>
            </div>

            <div className="flex border border-line rounded-lg overflow-hidden mb-3">
                {(['DEPOSIT', 'WITHDRAW'] as Tab[]).map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => { setActiveTab(tab); setStatus({ tag: 'idle' }) }}
                        className={`flex-1 py-1.5 text-[13px] font-semibold transition-colors
                            ${activeTab === tab
                                ? 'bg-accent/15 text-accent'
                                : 'bg-raised text-lo hover:text-mid'}`}
                    >
                        {tab === 'DEPOSIT' ? 'Deposit' : 'Withdraw'}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
                <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-lo">
                        Amount <span className="text-lo/60">(paise — 10000 = ₹100)</span>
                    </label>
                    <input
                        className={inputCls}
                        type="text"
                        inputMode="numeric"
                        placeholder="e.g. 10000 = ₹100.00"
                        value={amount}
                        disabled={submitting}
                        autoComplete="off"
                        onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting || !amount}
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
