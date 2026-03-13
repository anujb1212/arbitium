import React, { useCallback, useEffect, useState } from "react"
import { depositFunds, fetchHoldings, fetchTradingBalance, HoldingDTO, withdrawFunds } from "../lib/apiClient"
import { getMarketConfig } from "../types/market"

type TransferAction = "DEPOSIT" | "WITHDRAW"
type TransferStatus = "idle" | "submitting" | "success" | "error"
type ActiveModal = { asset: "INR"; action: TransferAction } | null

function toRupees(paise: bigint): string {
    return (Number(paise) / 100).toFixed(2)
}

export function Balances(): React.JSX.Element {
    const [available, setAvailable] = useState<bigint | null>(null)
    const [locked, setLocked] = useState<bigint | null>(null)
    const [activeModal, setActiveModal] = useState<ActiveModal>(null)
    const [amountRupees, setAmountRupees] = useState("")
    const [transferStatus, setTransferStatus] = useState<TransferStatus>("idle")
    const [errorMsg, setErrorMsg] = useState("")
    const [holdings, setHoldings] = useState<HoldingDTO[]>([])

    const loadBalance = useCallback(async () => {
        try {
            const data = await fetchTradingBalance()
            setAvailable(BigInt(data.available))
            setLocked(BigInt(data.locked))
        } catch { /* silent */ }
    }, [])

    const loadHoldings = useCallback(async () => {
        try {
            const data = await fetchHoldings()
            setHoldings(data)
        } catch { /* silent */ }
    }, [])

    useEffect(() => { loadBalance(); loadHoldings() }, [loadBalance, loadHoldings])

    const total = available !== null && locked !== null ? available + locked : null

    async function handleTransfer(): Promise<void> {
        const paise = Math.round(parseFloat(amountRupees) * 100)
        if (!paise || paise <= 0 || !activeModal) return

        setTransferStatus("submitting")
        try {
            const idempotencyKey = crypto.randomUUID()
            if (activeModal.action === "DEPOSIT") {
                await depositFunds({ amountInPaise: String(paise), idempotencyKey })
            } else {
                await withdrawFunds({ amountInPaise: String(paise), idempotencyKey })
            }
            setTransferStatus("success")
            setAmountRupees("")
            await loadBalance()
            setTimeout(() => { setTransferStatus("idle"); setActiveModal(null) }, 2000)
        } catch (err) {
            setErrorMsg((err as Error).message)
            setTransferStatus("error")
        }
    }

    function openModal(action: TransferAction): void {
        setActiveModal({ asset: "INR", action })
        setAmountRupees("")
        setTransferStatus("idle")
        setErrorMsg("")
    }

    function closeModal(): void {
        setActiveModal(null)
        setAmountRupees("")
        setTransferStatus("idle")
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">

            <div className="flex items-center justify-between px-4 py-3 border-b border-line flex-shrink-0">
                <div>
                    <div className="text-[11px] text-lo uppercase tracking-widest">Portfolio Value</div>
                    <div className="text-[20px] font-mono font-bold text-hi mt-0.5">
                        {total !== null ? `₹${toRupees(total)}` : "—"}
                    </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-lo">
                    <span className="w-1.5 h-1.5 rounded-full bg-bull" />
                    Connected via Vaultly
                </div>
            </div>

            <div className="flex-1 overflow-auto min-h-0">
                <table className="w-full text-[12px]">
                    <thead className="sticky top-0 bg-panel border-b border-line z-10">
                        <tr>
                            {["Asset", "Total Balance", "Available", "Locked (Orders)", ""].map((header, i) => (
                                <th
                                    key={i}
                                    className={`px-4 py-2 text-[11px] font-medium text-lo
                                        ${i === 0 ? "text-left" : "text-right"}`}
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-line/40 hover:bg-raised/30">
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30
                                        flex items-center justify-center text-[11px] font-bold text-accent">
                                        ₹
                                    </div>
                                    <div>
                                        <div className="text-[13px] font-semibold text-hi">Indian Rupee</div>
                                        <div className="text-[10px] font-mono text-lo">INR</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-hi">
                                {total !== null ? `₹${toRupees(total)}` : "—"}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-bull">
                                {available !== null ? `₹${toRupees(available)}` : "—"}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-mid">
                                {locked !== null ? `₹${toRupees(locked)}` : "—"}
                            </td>
                            <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => openModal("DEPOSIT")}
                                        className="px-3 py-1 rounded text-[11px] font-semibold
                                            text-accent hover:bg-accent/10 transition-colors"
                                    >
                                        Deposit
                                    </button>
                                    <button
                                        onClick={() => openModal("WITHDRAW")}
                                        className="px-3 py-1 rounded text-[11px] font-semibold
                                            text-lo hover:text-mid hover:bg-raised transition-colors"
                                    >
                                        Withdraw
                                    </button>
                                </div>
                            </td>
                        </tr>
                        {holdings.map((holding) => {
                            const config = getMarketConfig(holding.market);
                            const priceScale = config?.priceScale ?? 2;
                            const qtyScale = config?.qtyScale ?? 0;
                            const avgPriceHuman = (Number(holding.avgBuyPrice) / Math.pow(10, priceScale)).toFixed(priceScale);
                            const netQtyHuman = (Number(holding.netQty) / Math.pow(10, qtyScale)).toFixed(qtyScale);

                            return (
                                <tr key={holding.market} className="border-b border-line/40 hover:bg-raised/30">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-full bg-raised border border-line
                        flex items-center justify-center text-[11px] font-bold text-mid">
                                                {holding.asset.slice(0, 2)}
                                            </div>
                                            <div>
                                                <div className="text-[13px] font-semibold text-hi">{holding.asset}</div>
                                                <div className="text-[10px] font-mono text-lo">{holding.market}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono text-hi">
                                        {netQtyHuman} shares
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono text-bull">
                                        {netQtyHuman} shares
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono text-lo text-[11px]">
                                        avg ₹{avgPriceHuman}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {/* Sell action */}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {activeModal !== null && (
                <div className="border-t border-line px-4 py-3 bg-raised/30 flex items-center gap-3 flex-shrink-0">
                    <span className="text-[12px] font-semibold text-hi flex-shrink-0">
                        {activeModal.action === "DEPOSIT" ? "Deposit from Vaultly" : "Withdraw to Vaultly"}
                    </span>

                    <div className="relative flex-1 max-w-[180px]">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-mid">₹</span>
                        <input
                            type="text"
                            inputMode="decimal"
                            placeholder="0.00"
                            value={amountRupees}
                            disabled={transferStatus === "submitting"}
                            onChange={(e) => {
                                if (/^\d*\.?\d{0,2}$/.test(e.target.value)) setAmountRupees(e.target.value)
                            }}
                            className="w-full bg-base border border-line rounded pl-6 pr-2.5 py-1.5
                                font-mono text-xs text-hi outline-none focus:border-accent
                                transition-colors disabled:opacity-40"
                        />
                    </div>

                    <div className="flex gap-1.5">
                        {["100", "500", "1000"].map((preset) => (
                            <button
                                key={preset}
                                type="button"
                                onClick={() => setAmountRupees(preset)}
                                className="px-2 py-1 rounded text-[10px] font-mono text-lo
                                    bg-raised hover:bg-line hover:text-mid transition-colors"
                            >
                                ₹{preset}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleTransfer}
                        disabled={!amountRupees || transferStatus === "submitting"}
                        className={`px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-colors
                            disabled:opacity-40 disabled:cursor-not-allowed
                            ${activeModal.action === "DEPOSIT"
                                ? "bg-accent/15 text-accent hover:bg-accent/25"
                                : "bg-bear/15 text-bear hover:bg-bear/25"}`}
                    >
                        {transferStatus === "submitting" ? "…" : "Confirm"}
                    </button>

                    <button onClick={closeModal} className="text-lo hover:text-mid text-lg leading-none">
                        ×
                    </button>

                    {transferStatus === "success" && (
                        <span className="text-[11px] text-bull font-mono flex-shrink-0">✓ Done</span>
                    )}
                    {transferStatus === "error" && (
                        <span className="text-[11px] text-bear font-mono truncate max-w-[160px] flex-shrink-0">
                            {errorMsg}
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}
