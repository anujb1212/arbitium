import React, { useMemo, useState } from "react";
import type { MarketConfig } from "../types/market";
import type { OpenOrder } from "../hooks/useOpenOrders";
import { cancelOrder } from "../lib/apiClient";
import { formatPrice, formatQty } from "../lib/format";

type Props = {
    config: MarketConfig;
    openOrders: OpenOrder[];
};

function truncateId(orderId: string): string {
    return `${orderId.slice(0, 8)}…`;
}

export function OpenOrdersPanel(props: Props): React.JSX.Element {
    const { config, openOrders } = props;
    const [cancelingIds, setCancelingIds] = useState<Set<string>>(() => new Set());

    const rows = useMemo(() => openOrders, [openOrders]);

    async function handleCancel(orderId: string): Promise<void> {
        if (cancelingIds.has(orderId)) return;
        setCancelingIds((prev) => new Set(prev).add(orderId));
        try {
            await cancelOrder({ orderId, market: config.market });
        } catch (err) {
            console.error("[cancel] failed:", err)
            alert(`Cancel failed: ${(err as Error).message}`)
        } finally {
            setCancelingIds((prev) => {
                const next = new Set(prev);
                next.delete(orderId);
                return next;
            });
        }
    }

    return (
        <div className="bg-panel border-t border-line">
            <div className="px-5 py-2 flex items-center justify-between">
                <div className="text-[11px] font-semibold text-lo uppercase tracking-wider">
                    Open Orders
                </div>
                <div className="text-[11px] font-mono text-mid">{rows.length}</div>
            </div>

            {rows.length === 0 ? (
                <div className="px-5 pb-3 text-[12px] text-mid">No open orders</div>
            ) : (
                <div className="px-3 pb-3">
                    <div className="grid grid-cols-12 gap-2 px-2 py-1 text-[11px] text-lo">
                        <div className="col-span-3">Order</div>
                        <div className="col-span-2">Side</div>
                        <div className="col-span-3">Price</div>
                        <div className="col-span-2">Rem</div>
                        <div className="col-span-2 text-right">Action</div>
                    </div>

                    <div className="max-h-[140px] overflow-auto min-h-0">
                        {rows.map((order) => {
                            const sideColor = order.side === "BUY" ? "text-bull" : "text-bear";
                            const canceling = cancelingIds.has(order.orderId);
                            const statusText = order.status === "SUBMITTING" ? "Submitting" : "Open";

                            return (
                                <div
                                    key={order.orderId}
                                    className="grid grid-cols-12 gap-2 items-center px-2 py-1.5 border-t border-line/60"
                                >
                                    <div className="col-span-3 font-mono text-[12px] text-hi">
                                        {truncateId(order.orderId)}
                                        <span className="ml-2 text-[10px] text-lo/70">{statusText}</span>
                                    </div>
                                    <div className={`col-span-2 font-semibold ${sideColor}`}>
                                        {order.side}
                                    </div>
                                    <div className="col-span-3 font-mono text-[12px] text-hi">
                                        {formatPrice(order.price, config.priceScale)}
                                    </div>
                                    <div className="col-span-2 font-mono text-[12px] text-hi">
                                        {formatQty(order.remainingQty, config.qtyScale)}
                                    </div>
                                    <div className="col-span-2 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => handleCancel(order.orderId)}
                                            disabled={canceling}
                                            className="px-2.5 py-1 rounded border border-line bg-raised text-[11px] font-semibold text-bear hover:bg-bear/10 disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            {canceling ? "Canceling…" : "Cancel"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}