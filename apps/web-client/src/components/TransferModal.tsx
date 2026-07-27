import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    depositFunds,
    withdrawFunds,
    fetchTransferHistory,
    type TransferResult,
    type TransferHistoryRow,
} from "../lib/apiClient";

type Tab = "deposit" | "withdraw";
type Status =
    | { tag: "idle" }
    | { tag: "pending" }
    | { tag: "success"; result: TransferResult }
    | { tag: "error"; message: string };

type Props = {
    onClose: () => void;
    initialTab?: Tab;
    availableBalance: bigint;
};

const CHIPS = [100n, 500n, 1000n] as const;

function paiseToRupees(paise: bigint): string {
    return (Number(paise) / 100).toFixed(2);
}

export function TransferModal({ onClose, initialTab = "deposit", availableBalance }: Props): React.JSX.Element {
    const [tab, setTab] = useState<Tab>(initialTab);
    const [amount, setAmount] = useState("");
    const [status, setStatus] = useState<Status>({ tag: "idle" });
    const [history, setHistory] = useState<TransferHistoryRow[]>([]);
    const idempotencyKeyRef = useRef(crypto.randomUUID());

    const amountInPaise = (() => {
        const n = parseFloat(amount);
        if (isNaN(n) || n <= 0) return null;
        return BigInt(Math.round(n * 100));
    })();

    const isValid = amountInPaise !== null && amountInPaise > 0n;
    const canSubmit = isValid && status.tag !== "pending";
    const isPending = status.tag === "pending";

    const loadHistory = useCallback(async () => {
        try {
            const rows = await fetchTransferHistory();
            setHistory(rows.slice(0, 5));
        } catch { }
    }, []);

    useEffect(() => { loadHistory(); }, [loadHistory]);

    const handleSubmit = useCallback(async () => {
        if (!amountInPaise || !canSubmit) return;
        setStatus({ tag: "pending" });

        try {
            const fn = tab === "deposit" ? depositFunds : withdrawFunds;
            const result = await fn({
                amountInPaise: amountInPaise.toString(),
                idempotencyKey: idempotencyKeyRef.current,
            });
            setStatus({ tag: "success", result });
            setAmount("");
            idempotencyKeyRef.current = crypto.randomUUID();
            window.dispatchEvent(new Event("arbitium:auth"));
            loadHistory();
            setTimeout(() => setStatus({ tag: "idle" }), 3000);
        } catch (err: unknown) {
            let message = "Transfer failed";
            if (err instanceof Error) {
                if (/422/.test(err.message) && /INSUFFICIENT/i.test(err.message)) {
                    message = "Insufficient balance";
                } else if (err.message.includes("409")) {
                    message = "Duplicate request mismatch — retry with a new amount";
                    idempotencyKeyRef.current = crypto.randomUUID();
                }
            }
            setStatus({ tag: "error", message });
        }
    }, [amountInPaise, canSubmit, tab, loadHistory]);

    const fillChip = useCallback((chip: bigint) => {
        setAmount(String(Number(chip) / 100));
    }, []);

    const fillMax = useCallback(() => {
        setAmount(paiseToRupees(availableBalance));
    }, [availableBalance]);

    const directionLabel = tab === "deposit" ? "Deposit" : "Withdraw";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-panel border border-line rounded-xl p-6 w-[380px] flex flex-col gap-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 bg-line/40 rounded-lg p-0.5">
                        <button
                            onClick={() => { setTab("deposit"); setStatus({ tag: "idle" }); }}
                            className={`px-4 py-1.5 rounded-md text-[12px] font-bold transition-all active:scale-[0.98] ${tab === "deposit" ? "bg-raised text-hi shadow-sm" : "text-lo hover:text-mid"}`}
                        >
                            Deposit
                        </button>
                        <button
                            onClick={() => { setTab("withdraw"); setStatus({ tag: "idle" }); }}
                            className={`px-4 py-1.5 rounded-md text-[12px] font-bold transition-all active:scale-[0.98] ${tab === "withdraw" ? "bg-raised text-hi shadow-sm" : "text-lo hover:text-mid"}`}
                        >
                            Withdraw
                        </button>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-lo hover:text-hi text-[14px] font-semibold px-2 py-1 bg-base rounded-md border border-line transition-colors active:scale-95"
                    >
                        Close
                    </button>
                </div>

                <div className="bg-base rounded-lg border border-line p-4">
                    <p className="text-[11px] font-medium text-lo uppercase tracking-wider mb-1">Trading Balance</p>
                    <p className="text-[16px] font-bold font-mono tabular-nums text-hi">
                        ₹{paiseToRupees(availableBalance)}
                    </p>
                </div>

                <div>
                    <label className="block text-[11px] font-medium text-lo uppercase tracking-wider mb-1.5">
                        Amount (₹)
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        disabled={isPending}
                        className="w-full bg-base border border-line rounded-lg px-3 py-2.5 text-[14px] font-mono font-bold text-hi placeholder:text-lo/40 outline-none focus:border-mid/50 transition-colors disabled:opacity-50"
                    />
                    <div className="flex gap-2 mt-2">
                        {CHIPS.map((chip) => (
                            <button
                                key={String(chip)}
                                onClick={() => fillChip(chip)}
                                disabled={isPending}
                                className="flex-1 py-1 rounded-md text-[11px] font-bold bg-line/40 text-mid hover:bg-line hover:text-hi transition-colors active:scale-[0.97] disabled:opacity-50"
                            >
                                ₹{Number(chip) / 100}
                            </button>
                        ))}
                        {tab === "withdraw" && (
                            <button
                                onClick={fillMax}
                                disabled={isPending || availableBalance === 0n}
                                className="flex-1 py-1 rounded-md text-[11px] font-bold bg-bull/15 text-bull hover:bg-bull/25 transition-colors active:scale-[0.97] disabled:opacity-50"
                            >
                                Max
                            </button>
                        )}
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className={`w-full py-3 rounded-lg text-[14px] font-bold transition-all active:scale-[0.98] shadow-sm
                        ${tab === "deposit" ? "bg-bull text-base hover:bg-bull/90" : "bg-bear text-white hover:bg-bear/90"}
                        disabled:opacity-40 disabled:cursor-not-allowed
                    `}
                >
                    {isPending ? "Processing..." : `${directionLabel} ₹${amount || "0.00"}`}
                </button>

                {status.tag === "success" && (
                    <div className="bg-bull/10 border border-bull/30 rounded-lg px-3 py-2 text-[12px] font-medium text-bull">
                        {status.result.status === "PENDING" ? "Transfer submitted — processing" : "Transfer completed successfully"}
                    </div>
                )}
                {status.tag === "error" && (
                    <div className="bg-bear/10 border border-bear/30 rounded-lg px-3 py-2 text-[12px] font-medium text-bear">
                        {status.message}
                    </div>
                )}

                {history.length > 0 && (
                    <div>
                        <p className="text-[10px] font-bold text-lo uppercase tracking-wider mb-2">Recent Transfers</p>
                        <div className="space-y-1">
                            {history.map((row) => {
                                const isDeposit = row.direction === "DEPOSIT";
                                const amountStr = paiseToRupees(BigInt(row.amountInPaise));
                                return (
                                    <div key={row.id} className="flex items-center justify-between text-[11px]">
                                        <span className={`font-medium ${isDeposit ? "text-bull" : "text-bear"}`}>
                                            {isDeposit ? "Deposited" : "Withdrew"} ₹{amountStr}
                                        </span>
                                        <span className={`text-[10px] font-medium ${row.status === "COMPLETED" ? "text-lo" : "text-mid"}`}>
                                            {row.status}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
