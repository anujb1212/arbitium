import React, { useState } from "react"
import type { MarketConfig } from "../types/market"
import type { OpenOrder } from "../hooks/useOpenOrders"
import { OpenOrders } from "./OpenOrders"
import { FillHistory } from "./FillHistory"
import { Positions } from "./Positions"

type Tab = "POSITIONS" | "ORDERS" | "TRADE_HISTORY"

type Props = {
    config: MarketConfig
    openOrders: OpenOrder[]
    selectedMarket: string
    accountRefreshKey: number
}

export const BottomPanel = React.memo(function BottomPanel({ config, openOrders, selectedMarket, accountRefreshKey }: Props): React.JSX.Element {
    const [activeTab, setActiveTab] = useState<Tab>("POSITIONS")

    return (
        <div className="flex flex-col h-full bg-panel overflow-hidden">
            
            <div className="flex items-center gap-0 px-5 flex-shrink-0 bg-base border-b border-line">
                {(["POSITIONS", "ORDERS", "TRADE_HISTORY"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 pt-2 pb-[7px] text-[11px] font-bold uppercase tracking-widest transition-all relative
                            ${activeTab === tab
                                ? 'text-hi bg-panel border-x border-t border-line rounded-t-[6px] -mb-px z-10'
                                : 'text-lo hover:text-hi'}`}
                    >
                        {tab === "POSITIONS" ? "Positions" : tab === "ORDERS" ? "Orders" : "Trade History"}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-auto min-h-0 bg-panel">
                
                {activeTab === "POSITIONS" && <Positions accountRefreshKey={accountRefreshKey} />}

                {activeTab === "ORDERS" && <OpenOrders config={config} openOrders={openOrders} />}
                {activeTab === "TRADE_HISTORY" && <FillHistory market={selectedMarket} config={config} refreshKey={accountRefreshKey} />}
                
            </div>
            
        </div>
    )
})
