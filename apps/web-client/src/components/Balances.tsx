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

    return (
        <div className="flex flex-col h-full overflow-hidden bg-panel">
            <div className="flex items-center justify-between px-5 py-4 border-b border-line flex-shrink-0">
                <div>
                    <div className="text-[11px] font-medium text-lo uppercase tracking-widest">Portfolio Value</div>
                    <div className="text-[22px] font-mono font-bold text-hi mt-1">
                        {total !== null ? `INR ${toRupees(total)}` : "-"}
                    </div>
                </div>
                <div className="flex items-center gap-2 text-[12px] font-medium text-lo bg-base px-3 py-1.5 rounded-full border border-line">
                    <span className="w-2 h-2 rounded-full bg-bull" />
                    Vaultly Connected
                </div>
            </div>

            <div className="flex-1 overflow-auto scrollbar-thin min-h-0">
                <table className="w-full min-w-[720px] text-left border-collapse">
                    <thead className="sticky top-0 bg-panel z-10 after:absolute after:inset-x-0 after:bottom-0 after:border-b after:border-line">
                        <tr>
                            {["Asset", "Total Balance", "Available", "Locked", ""].map((header, i) => (
                                <th
                                    key={i}
                                    className={`px-5 py-3 text-[11px] font-medium text-lo uppercase tracking-wider
                                        ${i > 0 && i < 4 ? "text-right" : ""}`}
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-line/40">
                        <tr className="hover:bg-raised/40 transition-colors group">
                            <td className="px-5 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-[12px] font-bold text-accent">
                                        Rs
                                    </div>
                                    <div>
                                        <div className="text-[13px] font-bold text-hi">Indian Rupee</div>
                                        <div className="text-[11px] font-mono text-lo">INR</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-5 py-3 text-right font-mono tabular-nums text-[13px] font-medium text-hi">
                                {total !== null ? `${toRupees(total)}` : "-"}
                            </td>
                            <td className="px-5 py-3 text-right font-mono tabular-nums text-[13px] text-bull">
                                {available !== null ? `${toRupees(available)}` : "-"}
                            </td>
                            <td className="px-5 py-3 text-right font-mono tabular-nums text-[13px] text-mid">
                                {locked !== null ? `${toRupees(locked)}` : "-"}
                            </td>
                            <td className="px-5 py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => openModal("DEPOSIT")}
                                        className="px-3 py-1.5 rounded bg-accent/10 text-[12px] font-bold text-accent hover:bg-accent/20 transition-colors"
                                    >
                                        Deposit
                                    </button>
                                    <button
                                        onClick={() => openModal("WITHDRAW")}
                                        className="px-3 py-1.5 rounded bg-base border border-line text-[12px] font-bold text-hi hover:bg-raised hover:border-mid/50 transition-colors"
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
                                <tr key={holding.market} className="hover:bg-raised/40 transition-colors group">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-base border border-line flex items-center justify-center text-[12px] font-bold text-hi">
                                                {holding.asset.slice(0, 2)}
                                            </div>
                                            <div>
                                                <div className="text-[13px] font-bold text-hi">{holding.asset}</div>
                                                <div className="text-[11px] font-mono text-lo">{holding.market}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-right font-mono tabular-nums text-[13px] font-medium text-hi">
                                        {netQtyHuman}
                                    </td>
                                    <td className="px-5 py-3 text-right font-mono tabular-nums text-[13px] text-bull">
                                        {netQtyHuman}
                                    </td>
                                    <td className="px-5 py-3 text-right font-mono tabular-nums text-[12px] text-lo">
                                        Avg INR {avgPriceHuman}
                                    </td>
                                    <td className="px-5 py-3 text-right"></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {activeModal !== null && (
                <div className="border-t border-line px-5 py-4 bg-base flex items-center gap-4 flex-shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.2)] z-20">
                    <span className="text-[13px] font-bold text-hi flex-shrink-0">
                        {activeModal.action === "DEPOSIT" ? "Deposit INR" : "Withdraw INR"}
                    </span>

                    <div className="relative flex-1 max-w-[200px]">
                        <input
                            type="text"
                            inputMode="decimal"
                            placeholder="0.00"
                            value={amountRupees}
                            disabled={transferStatus === "submitting"}
                            onChange={(e) => {
                                if (/^\d*\.?\d{0,2}$/.test(e.target.value)) setAmountRupees(e.target.value)
                            }}
                            className="w-full bg-panel border border-line rounded-md px-3 py-2
                                font-mono text-[13px] text-hi outline-none focus:border-accent focus:ring-1 focus:ring-accent/30
                                transition-all disabled:opacity-50"
                        />
                    </div>

                    <div className="flex gap-2">
                        {["100", "500", "1000"].map((preset) => (
                            <button
                                key={preset}
                                type="button"
                                onClick={() => setAmountRupees(preset)}
                                className="px-3 py-1.5 rounded bg-panel border border-line text-[11px] font-mono font-medium text-mid
                                    hover:text-hi hover:border-mid/50 transition-colors"
                            >
                                {preset}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleTransfer}
                        disabled={!amountRupees || transferStatus === "submitting"}
                        className={`px-5 py-2 rounded-md text-[13px] font-bold transition-all
                            disabled:opacity-40 disabled:cursor-not-allowed
                            ${activeModal.action === "DEPOSIT"
                                ? "bg-accent text-white hover:bg-accent/90"
                                : "bg-hi text-base hover:bg-mid"}`}
                    >
                        {transferStatus === "submitting" ? "Processing..." : "Confirm"}
                    </button>

                    <button onClick={() => setActiveModal(null)} className="text-lo hover:text-hi text-[12px] font-semibold px-2">
                        Cancel
                    </button>

                    {transferStatus === "success" && (
                        <span className="text-[12px] text-bull font-bold flex-shrink-0">Success</span>
                    )}
                    {transferStatus === "error" && (
                        <span className="text-[12px] text-bear font-medium truncate max-w-[160px] flex-shrink-0">
                            {errorMsg}
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}
