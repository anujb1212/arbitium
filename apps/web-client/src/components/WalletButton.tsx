import React, { useEffect, useState, useCallback, useRef } from 'react'
import { isLoggedIn, redirectToVaultlyLogin, clearToken } from '../lib/auth'
import { fetchTradingBalance } from '../lib/apiClient'

type WalletState =
    | { tag: 'disconnected' }
    | { tag: 'connected'; availableBalance: bigint; dropdownOpen: boolean }

type Props = { onBonusGranted: () => void }

export function WalletButton({ onBonusGranted }: Props): React.JSX.Element {
    const [walletState, setWalletState] = useState<WalletState>({ tag: 'disconnected' })
    const [modalOpen, setModalOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    const loadBalance = useCallback(async (isSilent = false) => {
        if (!isLoggedIn()) return
        try {
            const data = await fetchTradingBalance()
            setWalletState(prev => ({
                tag: 'connected',
                availableBalance: BigInt(data.available),
                dropdownOpen: isSilent && prev.tag === 'connected' ? prev.dropdownOpen : false,
            }))
            if (data.welcomeBonusGranted) onBonusGranted()
        } catch {
            clearToken()
            setWalletState({ tag: 'disconnected' })
        }
    }, [onBonusGranted])

    useEffect(() => { loadBalance() }, [loadBalance])

    useEffect(() => {
        const onFocus = () => loadBalance(true)
        window.addEventListener('focus', onFocus)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') onFocus()
        })
        return () => {
            window.removeEventListener('focus', onFocus)
            document.removeEventListener('visibilitychange', onFocus)
        }
    }, [loadBalance])

    useEffect(() => {
        function onOutside(e: MouseEvent): void { if (ref.current && !ref.current.contains(e.target as Node)) setWalletState(prev => prev.tag === 'connected' ? { ...prev, dropdownOpen: false } : prev) }
        document.addEventListener("mousedown", onOutside)
        return () => document.removeEventListener("mousedown", onOutside)
    }, [])

    if (walletState.tag === 'disconnected') {
        return (
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setModalOpen(true)}
                    className="px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all active:scale-[0.98] bg-hi text-base hover:bg-mid shadow-sm"
                >
                    Connect Wallet
                </button>
                {modalOpen && (
                    <ConnectWalletModal
                        onClose={() => setModalOpen(false)}
                        onConnect={() => { setModalOpen(false); redirectToVaultlyLogin() }}
                    />
                )}
            </div>
        )
    }

    const formattedBalance = `₹${(Number(walletState.availableBalance) / 100).toFixed(2)}`

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setWalletState((prev) => prev.tag === 'connected' ? { ...prev, dropdownOpen: !prev.dropdownOpen } : prev)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] font-medium bg-panel border border-line hover:border-mid/50 hover:bg-raised transition-all active:scale-[0.98] shadow-sm"
            >
                <span className="font-mono tabular-nums text-hi">{formattedBalance}</span>
                <div className="flex items-center gap-1 pl-2 border-l border-line/60">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-lo">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-lo mt-0.5">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </div>
            </button>

            {walletState.dropdownOpen && (
                <div className="absolute right-0 top-[110%] mt-1 w-52 bg-panel border border-line rounded-xl shadow-xl z-50 py-1 origin-top-right animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-3 border-b border-line mb-1 bg-base/50">
                        <p className="text-[11px] font-medium text-lo uppercase tracking-wider">Vaultly Account</p>
                        <p className="text-[13px] font-bold text-hi mt-0.5 break-all flex items-center justify-between">
                            Connected
                            <button onClick={(e) => { e.stopPropagation(); loadBalance(true); }} className="p-1 hover:bg-line rounded text-mid hover:text-hi transition-colors" title="Refresh Balance">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" /></svg>
                            </button>
                        </p>
                    </div>
                    <button
                        onClick={() => { clearToken(); setWalletState({ tag: 'disconnected' }) }}
                        className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-bear hover:bg-bear/10 transition-colors"
                    >
                        Disconnect
                    </button>
                </div>
            )}
        </div>
    )
}

function ConnectWalletModal({ onClose, onConnect }: { onClose: () => void; onConnect: () => void }): React.JSX.Element {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose}>
            <div className="bg-panel border border-line rounded-xl p-6 w-[360px] flex flex-col gap-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <h2 className="text-[16px] font-bold text-hi tracking-tight">Vaultly Services</h2>
                    <button onClick={onClose} className="text-lo hover:text-hi text-[14px] font-semibold px-2 py-1 bg-base rounded-md border border-line transition-colors active:scale-95">Close</button>
                </div>
                <div className="flex flex-col gap-3 bg-base p-4 rounded-lg border border-line">
                    <p className="text-[13px] font-medium text-mid">Action requires connection to Vaultly to enable:</p>
                    <ul className="flex flex-col gap-2">
                        {['Deposit and withdraw instantly', 'Lock balance for orders', 'Track PNL securely'].map((item) => (
                            <li key={item} className="flex items-center gap-2 text-[13px] font-medium text-hi">
                                <span className="w-1.5 h-1.5 rounded-full bg-hi" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
                <button onClick={onConnect} className="w-full py-3 rounded-lg text-[14px] font-bold bg-hi text-base hover:bg-mid transition-all active:scale-[0.98] shadow-sm">
                    Connect / Authorize
                </button>
            </div>
        </div>
    )
}
