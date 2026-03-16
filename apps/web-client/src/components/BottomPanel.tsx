import React, { useState } from "react"
import type { MarketConfig } from "../types/market"
import type { OpenOrder } from "../hooks/useOpenOrders"
import { Balances } from "./Balances"
import { OpenOrders } from "./OpenOrders"
import { FillHistory } from "./FillHistory"
import { OrderHistory } from "./OrderHistory"

type Tab = "BALANCES" | "OPEN_ORDERS" | "FILL_HISTORY" | "ORDER_HISTORY"

type Props = {
    config: MarketConfig
    openOrders: OpenOrder[]
    selectedMarket: string
}

type TabDefinition = { id: Tab; label: string; badge?: number }

export function BottomPanel({ config, openOrders, selectedMarket }: Props): React.JSX.Element {
    const [activeTab, setActiveTab] = useState<Tab>("OPEN_ORDERS")

    const tabs: TabDefinition[] = [
        { id: "BALANCES", label: "Balances" },
        { id: "OPEN_ORDERS", label: "Open Orders", badge: openOrders.length > 0 ? openOrders.length : undefined },
        { id: "FILL_HISTORY", label: "Fill History" },
        { id: "ORDER_HISTORY", label: "Order History" },
    ]

    return (
        <div className="flex flex-col h-full bg-panel overflow-hidden">
            <div className="flex items-center gap-1.5 border-b border-line px-3 pt-2 flex-shrink-0 bg-base">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 text-[13px] font-semibold rounded-t-lg transition-all
                            ${activeTab === tab.id
                                ? "bg-panel text-hi border-t border-x border-line -mb-px shadow-[0_-2px_10px_rgba(0,0,0,0.2)]"
                                : "text-lo hover:text-mid border-t border-x border-transparent hover:bg-raised/50 -mb-px"}`}
                    >
                        {tab.label}
                        {tab.badge !== undefined && (
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full leading-none transition-colors
                                ${activeTab === tab.id ? "bg-accent/20 text-accent" : "bg-line text-mid"}`}>
                                {tab.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-auto min-h-0 bg-panel">
                {activeTab === "BALANCES" && <Balances />}
                {activeTab === "OPEN_ORDERS" && <OpenOrders config={config} openOrders={openOrders} />}
                {activeTab === "FILL_HISTORY" && <FillHistory market={selectedMarket} config={config} />}
                {activeTab === "ORDER_HISTORY" && <OrderHistory market={selectedMarket} config={config} />}
            </div>
        </div>
    )
}
