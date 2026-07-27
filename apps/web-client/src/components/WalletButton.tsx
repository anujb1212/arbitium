import React, { useEffect, useState, useCallback, useRef } from 'react'
import { isLoggedIn, connectVaultly, clearToken } from '../lib/auth'
import { fetchTradingBalance } from '../lib/apiClient'
import { ConnectWalletModal } from './ConnectWalletModal'
import { TransferModal } from './TransferModal'

type WalletState =
    | { tag: 'disconnected' }
    | { tag: 'connected'; availableBalance: bigint; dropdownOpen: boolean }

type Props = { onBonusGranted: () => void }

export const WalletButton = React.memo(function WalletButton({ onBonusGranted }: Props): React.JSX.Element {
    const [walletState, setWalletState] = useState<WalletState>({ tag: 'disconnected' })
    const [modalOpen, setModalOpen] = useState(false)
    const [transferOpen, setTransferOpen] = useState(false)
    const [transferTab, setTransferTab] = useState<'deposit' | 'withdraw'>('deposit')
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
        const handleAuth = () => {
            if (isLoggedIn()) {
                loadBalance(true);
            } else {
                setWalletState({ tag: 'disconnected' });
            }
        };
        window.addEventListener('arbitium:auth', handleAuth);
        return () => window.removeEventListener('arbitium:auth', handleAuth);
    }, [loadBalance]);

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
                        onConnect={() => { setModalOpen(false); connectVaultly() }}
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
                        onClick={() => { setWalletState(prev => prev.tag === 'connected' ? { ...prev, dropdownOpen: false } : prev); setTransferTab('deposit'); setTransferOpen(true); }}
                        className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-bull hover:bg-bull/10 transition-colors"
                    >
                        Deposit
                    </button>
                    <button
                        onClick={() => { setWalletState(prev => prev.tag === 'connected' ? { ...prev, dropdownOpen: false } : prev); setTransferTab('withdraw'); setTransferOpen(true); }}
                        className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-bear hover:bg-bear/10 transition-colors"
                    >
                        Withdraw
                    </button>
                    <button
                        onClick={() => { clearToken(); setWalletState({ tag: 'disconnected' }) }}
                        className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-bear hover:bg-bear/10 transition-colors"
                    >
                        Disconnect
                    </button>
                </div>
            )}
            {transferOpen && (
                <TransferModal
                    onClose={() => setTransferOpen(false)}
                    initialTab={transferTab}
                    availableBalance={walletState.tag === 'connected' ? walletState.availableBalance : 0n}
                />
            )}
        </div>
    )
})
