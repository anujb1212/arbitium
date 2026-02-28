import React, { useEffect, useState, useCallback } from 'react'
import { isLoggedIn, redirectToVaultlyLogin, clearToken } from '../lib/auth'
import { fetchTradingBalance } from '../lib/apiClient'

type WalletState =
    | { tag: 'disconnected' }
    | { tag: 'connected'; availableBalance: bigint; dropdownOpen: boolean }

type Props = {
    onBonusGranted: () => void
}

export function WalletButton({ onBonusGranted }: Props): React.JSX.Element {
    const [walletState, setWalletState] = useState<WalletState>({ tag: 'disconnected' })
    const [modalOpen, setModalOpen] = useState(false)

    const loadBalance = useCallback(async () => {
        if (!isLoggedIn()) return
        try {
            const data = await fetchTradingBalance()
            setWalletState({
                tag: 'connected',
                availableBalance: BigInt(data.available),
                dropdownOpen: false,
            })
            if (data.welcomeBonusGranted) onBonusGranted()
        } catch {
            // token expired or invalid
            clearToken()
            setWalletState({ tag: 'disconnected' })
        }
    }, [onBonusGranted])

    useEffect(() => {
        loadBalance()
    }, [loadBalance])

    if (walletState.tag === 'disconnected') {
        return (
            <>
                <button
                    onClick={() => setModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg text-[13px] font-semibold
                        bg-accent/15 text-accent hover:bg-accent/25 transition-colors"
                >
                    Connect Vaultly
                </button>

                {modalOpen && (
                    <ConnectWalletModal
                        onClose={() => setModalOpen(false)}
                        onConnect={() => {
                            setModalOpen(false)
                            redirectToVaultlyLogin()
                        }}
                    />
                )}
            </>
        )
    }

    const formattedBalance = `₹${(Number(walletState.availableBalance) / 100).toFixed(2)}`

    return (
        <div className="relative">
            <button
                onClick={() =>
                    setWalletState((prev) =>
                        prev.tag === 'connected'
                            ? { ...prev, dropdownOpen: !prev.dropdownOpen }
                            : prev
                    )
                }
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px]
                    font-semibold bg-raised text-hi hover:bg-line transition-colors"
            >
                <span className="w-2 h-2 rounded-full bg-bull inline-block" />
                <span className="font-mono">{formattedBalance}</span>
                <span className="text-lo">Vaultly</span>
            </button>

            {walletState.dropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-panel border
                    border-line rounded-lg shadow-lg z-50 py-1">
                    <button
                        onClick={() => {
                            clearToken()
                            setWalletState({ tag: 'disconnected' })
                        }}
                        className="w-full text-left px-4 py-2 text-[13px] text-bear
                            hover:bg-raised transition-colors"
                    >
                        Disconnect
                    </button>
                </div>
            )}
        </div>
    )
}

function ConnectWalletModal({
    onClose,
    onConnect,
}: {
    onClose: () => void
    onConnect: () => void
}): React.JSX.Element {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            onClick={onClose}
        >
            <div
                className="bg-panel border border-line rounded-xl p-6 w-[340px] flex flex-col gap-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-[15px] font-bold text-hi">Connect Vaultly Wallet</h2>
                    <button onClick={onClose} className="text-lo hover:text-hi text-lg leading-none">×</button>
                </div>

                <p className="text-[13px] text-mid leading-relaxed">
                    Vaultly is your fund source. Connect to:
                </p>

                <ul className="flex flex-col gap-2">
                    {[
                        'Deposit & withdraw funds instantly',
                        'Lock balance for orders',
                        'Real-time P&L tracking',
                    ].map((item) => (
                        <li key={item} className="flex items-start gap-2 text-[13px] text-mid">
                            <span className="text-bull mt-0.5">✓</span>
                            {item}
                        </li>
                    ))}
                </ul>

                <div className="bg-accent/10 border border-accent/20 rounded-lg px-4 py-3">
                    <p className="text-[13px] text-accent font-semibold">
                        ₹500 welcome bonus on first connect
                    </p>
                    <p className="text-[11px] text-mid mt-0.5">
                        Credited automatically to your trading balance
                    </p>
                </div>

                <button
                    onClick={onConnect}
                    className="w-full py-2.5 rounded-lg text-[13px] font-semibold
                        bg-accent/15 text-accent hover:bg-accent/25 transition-colors"
                >
                    Connect with Vaultly →
                </button>
            </div>
        </div>
    )
}
