import React, { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MARKETS, getMarketConfig } from '../types/market'
import type { WireEventEnvelope } from '../types/wire'
import { useMarketFeed } from '../ws/useMarketFeed'

import { Chart } from '../components/Chart'
import { useOrderBook } from '../hooks/useOrderBook'
import { useTradeFeed } from '../hooks/useTradeFeed'
import { OrderForm } from '../components/OrderForm'
import { TradeFeed } from '../components/TradeFeed'
import { OrderBook } from '../components/OrderBook'
import { useMarketStats } from '../hooks/useMarketStats'
import { useOpenOrders } from '../hooks/useOpenOrders'
import { MarketHeaderBar } from '../components/MarketHeaderBar'
import { OpenOrdersPanel } from '../components/OpenOrdersPanel'
import { CommandRejectedToast } from '../components/CommandRejectedToast'
import { BalancePanel } from '../components/BalancePanel'
import { WalletButton } from '../components/WalletButton'

export default function TradePage(): React.JSX.Element {
    const { market: marketParam } = useParams<{ market: string }>()
    const navigate = useNavigate()

    const validMarket =
        MARKETS.find((m) => m.market === marketParam)?.market ?? MARKETS[0].market

    const [selectedMarket, setSelectedMarket] = useState(validMarket)
    const [eventCount, setEventCount] = useState(0)
    const [rejectToast, setRejectToast] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<"BOOK" | "TRADES">("BOOK")
    const [showBonusToast, setShowBonusToast] = useState(false)

    const { bids, asks, dispatchDelta, resetBook } = useOrderBook()
    const { trades, dispatchTrade, resetFeed } = useTradeFeed()
    const { stats, onTrade, reset: resetStats } = useMarketStats()
    const openOrders = useOpenOrders()

    const handleEvent = useCallback(
        (event: WireEventEnvelope): void => {
            setEventCount((n) => n + 1)
            if (event.kind === 'BOOK_DELTA') {
                dispatchDelta(event.payload)
                openOrders.applyDelta(event.payload)
            }
            if (event.kind === 'TRADE') {
                dispatchTrade(event.payload)
                onTrade(event.payload)
            }
            if (event.kind === 'COMMAND_REJECTED') {
                if (event.commandId) {
                    openOrders.removeByCommandId(event.commandId)
                }
                setRejectToast(event.payload.rejectReason)
            }
        },
        [dispatchDelta, dispatchTrade, onTrade, openOrders],
    )

    function handleMarketChange(market: string): void {
        setSelectedMarket(market)
        setEventCount(0)
        setRejectToast(null)
        resetBook()
        resetFeed()
        resetStats()
        openOrders.reset()
        navigate(`/trade/${market}`, { replace: true })
    }

    useMarketFeed(selectedMarket, handleEvent)

    const config = getMarketConfig(selectedMarket)!

    const bestBidPrice = bids.length > 0 ? bids[0]?.price ?? null : null
    const bestAskPrice = asks.length > 0 ? asks[0]?.price ?? null : null

    const handleBonusGranted = useCallback(() => {
        setShowBonusToast(true)
    }, [])

    return (
        <div
            className="bg-base text-hi font-sans text-[13px] overflow-hidden"
            style={{ display: 'grid', gridTemplateRows: '56px 1fr', height: '100vh' }}
        >
            <header className="flex items-center gap-8 px-6 border-b border-line bg-panel">
                <button
                    onClick={() => navigate('/')}
                    className="text-[17px] font-bold tracking-tight hover:text-mid transition-colors"
                >
                    Arbitium
                </button>
                <nav className="flex gap-1">
                    {MARKETS.map((m) => (
                        <button
                            key={m.market}
                            onClick={() => handleMarketChange(m.market)}
                            className={`px-3 py-1.5 rounded text-[13px] font-medium transition-colors
                ${selectedMarket === m.market
                                    ? 'bg-accent/15 text-accent'
                                    : 'text-mid hover:bg-raised hover:text-hi'}`}
                        >
                            {m.market}
                        </button>
                    ))}
                </nav>
                <div className="ml-auto">
                    <div className="ml-auto flex items-center gap-4">
                        <span className={`text-[11px] font-mono ${eventCount > 0 ? 'text-bull' : 'text-lo'}`}>
                            {eventCount > 0 ? `Live ${eventCount}` : 'Connecting…'}
                        </span>
                        <WalletButton onBonusGranted={handleBonusGranted} />
                    </div>
                </div>
            </header>

            <div className="flex overflow-hidden w-full">
                <div className="relative flex flex-1 min-w-0 flex-col overflow-hidden">
                    <MarketHeaderBar
                        config={config}
                        stats={stats}
                        bestBidPrice={bestBidPrice}
                        bestAskPrice={bestAskPrice}
                    />

                    <div className="flex-1 min-h-0 relative w-full">
                        <Chart
                            trades={trades}
                            lastTradePrice={stats.lastPrice}
                            config={config}
                        />
                    </div>

                    <div className="h-[240px] flex-shrink-0 min-h-0 border-t border-line overflow-hidden flex flex-col w-full">
                        <OpenOrdersPanel config={config} openOrders={openOrders.openOrders} />
                    </div>
                </div>

                <div className="w-[300px] border-l border-r border-line flex flex-col bg-panel flex-shrink-0 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2 border-b border-line/60 flex-shrink-0">
                        <button
                            onClick={() => setActiveTab("BOOK")}
                            className={`px-3 py-1.5 rounded-md text-[13px] font-semibold transition-colors ${activeTab === "BOOK" ? "bg-raised text-hi" : "text-lo hover:text-mid"
                                }`}
                        >
                            Book
                        </button>
                        <button
                            onClick={() => setActiveTab("TRADES")}
                            className={`px-3 py-1.5 rounded-md text-[13px] font-semibold transition-colors ${activeTab === "TRADES" ? "bg-raised text-hi" : "text-lo hover:text-mid"
                                }`}
                        >
                            Trades
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden min-h-0 relative">
                        <div className={`absolute inset-0 ${activeTab === "BOOK" ? "block" : "hidden"}`}>
                            <OrderBook bids={bids} asks={asks} config={config} />
                        </div>
                        <div className={`absolute inset-0 ${activeTab === "TRADES" ? "block" : "hidden"}`}>
                            <TradeFeed trades={trades} config={config} />
                        </div>
                    </div>
                </div>

                <div className="w-[320px] flex flex-col bg-panel flex-shrink-0 overflow-y-auto overflow-x-hidden relative">
                    <div className="flex-1">
                        <OrderForm
                            config={config}
                            onPlaceSubmitted={(draft) => {
                                openOrders.addOptimistic(draft)
                            }}
                            onPlaceAccepted={({ orderId, commandId }) => {
                                openOrders.ackAccepted({ orderId, commandId })
                            }}
                            onPlaceFailed={({ orderId }) => {
                                openOrders.removeByOrderId(orderId)
                            }}
                        />
                    </div>

                    <BalancePanel />

                    {rejectToast !== null && (
                        <CommandRejectedToast message={rejectToast} onClose={() => setRejectToast(null)} />
                    )}
                </div>
            </div>
            {showBonusToast && (
                <div className="fixed bottom-6 right-6 z-50 bg-panel border border-accent/30
        rounded-xl px-5 py-3 shadow-lg flex items-center gap-3">
                    <span className="text-accent text-lg">🎁</span>
                    <div>
                        <p className="text-[13px] font-semibold text-hi">₹500 bonus credited!</p>
                        <p className="text-[11px] text-mid">Welcome to Arbitium</p>
                    </div>
                    <button onClick={() => setShowBonusToast(false)}
                        className="text-lo hover:text-hi ml-2">X</button>
                </div>
            )}
        </div>
    )
}
