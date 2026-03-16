import React, { useEffect, useState, useCallback, useId } from 'react'
import { depositFunds, withdrawFunds, fetchTradingBalance } from '../lib/apiClient'

const inputCls =
    'w-full bg-base border border-line rounded-lg px-3 py-2.5 font-mono text-[13px] text-hi ' +
    'outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all placeholder:text-lo disabled:opacity-50'

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

function parseApiError(raw: string): string {
    try {
        const match = raw.match(/^\d+:\s*(.*)$/)
        const cleanStr = match ? match[1] : raw
        let msg = cleanStr
        try {
            const parsed = JSON.parse(cleanStr)
            msg = parsed.error || parsed.message || cleanStr
        } catch { }
        return msg.charAt(0).toUpperCase() + msg.slice(1)
    } catch {
        return raw
    }
}

export function BalancePanel(): React.JSX.Element {
    const amountId = useId()
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

    useEffect(() => {
        loadBalance()
        const onFocus = () => loadBalance()
        window.addEventListener('focus', onFocus)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') onFocus()
        })
        return () => {
            window.removeEventListener('focus', onFocus)
            document.removeEventListener('visibilitychange', onFocus)
        }
    }, [loadBalance])

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
            setStatus({ tag: 'success', message: `${verb} ₹${parseFloat(amountRupees).toFixed(2)} successfully` })
            setAmountRupees('')
            await loadBalance()
            setTimeout(() => setStatus({ tag: 'idle' }), 3000)
        } catch (err) {
            setStatus({ tag: 'error', message: parseApiError((err as Error).message) })
        }
    }

    const formattedBalance = availableBalance !== null
        ? `₹${(Number(availableBalance) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : '—'

    const presets = ['100', '500', '1000', '5000']

    return (
        <div className="px-5 py-5 bg-panel flex flex-col gap-5 h-full">

            <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-lo uppercase tracking-wider">Trading Balance</span>
                <span className="text-[15px] font-mono font-bold text-hi">{formattedBalance}</span>
            </div>

            <div className="flex bg-base p-1 rounded-lg border border-line">
                {(['DEPOSIT', 'WITHDRAW'] as Tab[]).map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => { setActiveTab(tab); setStatus({ tag: 'idle' }); setAmountRupees('') }}
                        className={`flex-1 py-1.5 text-[12px] font-semibold rounded-md transition-all active:scale-95
                            ${activeTab === tab
                                ? 'bg-raised text-hi shadow-sm'
                                : 'text-lo hover:text-mid'}`}
                    >
                        {tab === 'DEPOSIT' ? 'Deposit' : 'Withdraw'}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                    <label htmlFor={amountId} className="text-[12px] font-medium text-mid flex justify-between">
                        <span>Amount</span>
                        <span className="text-lo font-mono">INR</span>
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-mid font-mono">₹</span>
                        <input
                            id={amountId}
                            className={`${inputCls} pl-7`}
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
                </div>

                <div className="flex gap-2">
                    {presets.map((p) => (
                        <button
                            key={p}
                            type="button"
                            disabled={submitting}
                            onClick={() => setAmountRupees(p)}
                            className="flex-1 py-1.5 rounded-md text-[11px] font-mono font-medium text-lo
                                bg-base border border-line hover:border-mid/50 hover:text-hi transition-all active:scale-95
                                disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            +{p}
                        </button>
                    ))}
                </div>

                <div className="pt-2 flex flex-col gap-3">
                    <button
                        type="submit"
                        disabled={submitting || rupeesToPaise(amountRupees) <= 0}
                        className={`w-full py-3 rounded-lg text-[14px] font-bold transition-all active:scale-[0.98]
                            disabled:opacity-40 disabled:cursor-not-allowed shadow-sm
                            ${activeTab === 'DEPOSIT'
                                ? 'bg-bull text-base hover:bg-bull/90'
                                : 'bg-bear text-hi hover:bg-bear/90'}`}
                    >
                        {submitting
                            ? `${activeTab === 'DEPOSIT' ? 'Depositing' : 'Withdrawing'}…`
                            : activeTab === 'DEPOSIT' ? 'Deposit from Vaultly' : 'Withdraw to Vaultly'}
                    </button>

                    {status.tag === 'success' && (
                        <div className="flex items-center justify-center gap-2 text-[12px] font-mono font-bold text-bull mt-1 animate-in fade-in duration-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-bull animate-pulse" />
                            {status.message}
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
