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

type TabDefinition = {
    id: Tab
    label: string
    badge?: number
}

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
            <div className="flex items-center border-b border-line flex-shrink-0 px-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-medium
                            border-b-2 transition-colors
                            ${activeTab === tab.id
                                ? "border-accent text-hi"
                                : "border-transparent text-lo hover:text-mid"}`}
                    >
                        {tab.label}
                        {tab.badge !== undefined && (
                            <span className="bg-accent/20 text-accent text-[10px] font-mono
                                px-1.5 py-0.5 rounded-full leading-none">
                                {tab.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-auto min-h-0">
                {activeTab === "BALANCES" && <Balances />}
                {activeTab === "OPEN_ORDERS" && <OpenOrders config={config} openOrders={openOrders} />}
                {activeTab === "FILL_HISTORY" && <FillHistory market={selectedMarket} config={config} />}
                {activeTab === "ORDER_HISTORY" && <OrderHistory market={selectedMarket} config={config} />}
            </div>
        </div>
    )
}
