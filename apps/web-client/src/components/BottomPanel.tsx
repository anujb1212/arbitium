import React, { useState } from "react"
import type { MarketConfig } from "../types/market"
import type { OpenOrder } from "../hooks/useOpenOrders"
import { OpenOrders } from "./OpenOrders"
import { FillHistory } from "./FillHistory"
import { Inbox } from "lucide-react"

type Tab = "POSITIONS" | "ORDERS" | "TRADE_HISTORY"

type Props = {
    config: MarketConfig
    openOrders: OpenOrder[]
    selectedMarket: string
}

export function BottomPanel({ config, openOrders, selectedMarket }: Props): React.JSX.Element {
    const [activeTab, setActiveTab] = useState<Tab>("POSITIONS")

    return (
        <div className="flex flex-col h-full bg-panel overflow-hidden">
            
            <div className="flex items-center gap-6 border-b border-line px-5 flex-shrink-0 bg-base pt-2">
                <button
                    onClick={() => setActiveTab("POSITIONS")}
                    className={`pb-3 text-[11px] font-bold uppercase tracking-widest transition-all
                        ${activeTab === "POSITIONS" ? "text-hi border-b-[2px] border-hi" : "text-lo hover:text-hi border-b-[2px] border-transparent"}`}
                >
                    Positions
                </button>
                <button
                    onClick={() => setActiveTab("ORDERS")}
                    className={`pb-3 text-[11px] font-bold uppercase tracking-widest transition-all
                        ${activeTab === "ORDERS" ? "text-hi border-b-[2px] border-hi" : "text-lo hover:text-hi border-b-[2px] border-transparent"}`}
                >
                    Orders
                </button>
                <button
                    onClick={() => setActiveTab("TRADE_HISTORY")}
                    className={`pb-3 text-[11px] font-bold uppercase tracking-widest transition-all
                        ${activeTab === "TRADE_HISTORY" ? "text-hi border-b-[2px] border-hi" : "text-lo hover:text-hi border-b-[2px] border-transparent"}`}
                >
                    Trade History
                </button>
            </div>

            <div className="flex-1 overflow-auto min-h-0 bg-panel">
                
                {activeTab === "POSITIONS" && (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                        <div className="w-12 h-12 flex items-center justify-center mb-4">
                            <Inbox strokeWidth={1} className="w-12 h-12 text-lo opacity-50" />
                        </div>
                        <h3 className="text-[14px] font-bold text-hi mb-1">No positions yet</h3>
                        <p className="text-[12px] text-lo">Start trading to see your positions here.</p>
                    </div>
                )}

                {activeTab === "ORDERS" && <OpenOrders config={config} openOrders={openOrders} />}
                {activeTab === "TRADE_HISTORY" && <FillHistory market={selectedMarket} config={config} />}
                
            </div>
            
        </div>
    )
}
