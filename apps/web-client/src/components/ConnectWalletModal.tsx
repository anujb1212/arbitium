import React from 'react'

type Props = { onClose: () => void; onConnect: () => void }

export function ConnectWalletModal({ onClose, onConnect }: Props): React.JSX.Element {
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
