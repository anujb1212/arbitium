import React, { useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MARKETS, getMarketConfig } from '../types/market'
import type { WireEventEnvelope } from '../types/wire'
import { useMarketFeed } from '../ws/useMarketFeed'
import { fetchDepth, fetchOpenOrders, fetchRecentTrades, fetchTicker } from '../lib/apiClient'

import { Chart } from '../components/Chart'
import { useOrderBook } from '../hooks/useOrderBook'
import { useTradeFeed } from '../hooks/useTradeFeed'
import { OrderForm } from '../components/OrderForm'
import { OrderBook } from '../components/OrderBook'
import { useMarketStats } from '../hooks/useMarketStats'
import { useOpenOrders } from '../hooks/useOpenOrders'
import { MarketHeaderBar } from '../components/MarketHeaderBar'
import { OpenOrdersPanel } from '../components/OpenOrdersPanel'
import { CommandRejectedToast } from '../components/CommandRejectedToast'
import { BalancePanel } from '../components/BalancePanel'
import { WalletButton } from '../components/WalletButton'
import { TradeFeed } from '../components/TradeFeed'

export default function TradePage(): React.JSX.Element {
    const { market: marketParam } = useParams<{ market: string }>()
    const navigate = useNavigate()

    const validMarket =
        MARKETS.find((m) => m.market === marketParam)?.market ?? MARKETS[0].market

    const [selectedMarket, setSelectedMarket] = useState(validMarket)
    const [eventCount, setEventCount] = useState(0)
    const [rejectToast, setRejectToast] = useState<string | null>(null)
    const [showBonusToast, setShowBonusToast] = useState(false)
    const [bookTab, setBookTab] = useState<"BOOK" | "TRADES">("BOOK")

    const { bids, asks, dispatchDelta, resetBook, seedBook } = useOrderBook()
    const { trades, dispatchTrade, resetFeed, seedFeed } = useTradeFeed()
    const { stats, onTrade, seedStats, reset: resetStats } = useMarketStats()
    const openOrders = useOpenOrders()

    useEffect(() => {
        let cancelled = false

        fetchDepth(selectedMarket)
            .then((snapshot) => { if (!cancelled) seedBook(snapshot) })
            .catch(() => { })

        fetchRecentTrades(selectedMarket)
            .then((rawTrades) => { if (!cancelled) seedFeed(rawTrades) })
            .catch(() => { })

        fetchTicker(selectedMarket)
            .then((ticker) => { if (!cancelled) seedStats(ticker) })
            .catch(() => { })

        fetchOpenOrders(selectedMarket)
            .then((orders) => { if (!cancelled) openOrders.seedFromDB(orders) })
            .catch(() => { })

        return () => { cancelled = true }
    }, [selectedMarket, seedBook, seedFeed, seedStats])

    const handleEvent = useCallback(
        (event: WireEventEnvelope): void => {
            setEventCount((n) => n + 1)

            if (event.kind === 'BOOK_DELTA') {
                dispatchDelta(event.payload, event.eventId)
                openOrders.applyDelta(event.payload, event.eventId)
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
        [dispatchDelta, dispatchTrade, onTrade, openOrders]
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
            className="bg-base text-hi font-sans text-[13px]"
            style={{ display: 'grid', gridTemplateRows: '48px 1fr 220px', height: '100dvh' }}
        >
            <header className="flex items-center gap-3 px-4 border-b border-line bg-panel flex-shrink-0 overflow-x-auto">
                <button
                    onClick={() => navigate('/')}
                    className="text-[15px] font-bold tracking-tight hover:text-mid transition-colors flex-shrink-0"
                >
                    Arbitium
                </button>

                <div className="w-px h-5 bg-line flex-shrink-0" />

                <nav className="flex gap-0.5 flex-shrink-0">
                    {MARKETS.map((m) => (
                        <button
                            key={m.market}
                            onClick={() => handleMarketChange(m.market)}
                            className={`px-3 py-1.5 rounded text-[12px] font-medium transition-colors
                                ${selectedMarket === m.market
                                    ? 'bg-accent/15 text-accent'
                                    : 'text-mid hover:bg-raised hover:text-hi'}`}
                        >
                            {m.market}
                        </button>
                    ))}
                </nav>

                <div className="ml-auto flex items-center gap-3 flex-shrink-0">
                    <div className={`flex items-center gap-1.5 text-[11px] font-mono
                        ${eventCount > 0 ? 'text-bull' : 'text-lo'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0
                            ${eventCount > 0 ? 'bg-bull' : 'bg-lo'}`} />
                        {eventCount > 0 ? `Live · ${eventCount}` : 'Connecting…'}
                    </div>
                    <WalletButton onBonusGranted={handleBonusGranted} />
                </div>
            </header>

            {/* Main content */}
            <div className="flex overflow-hidden" style={{ minHeight: 0 }}>

                {/* Left */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <MarketHeaderBar
                        config={config}
                        stats={stats}
                        bestBidPrice={bestBidPrice}
                        bestAskPrice={bestAskPrice}
                    />
                    <div className="flex-1 min-h-0 relative">
                        <Chart
                            trades={trades}
                            lastTradePrice={stats.lastPrice}
                            config={config}
                        />
                    </div>
                </div>

                {/* Center: Order Book */}
                <div className="w-[272px] border-l border-line flex-shrink-0 flex flex-col overflow-hidden">
                    <div className="flex items-center gap-1 px-2 py-1.5 border-b border-line flex-shrink-0">
                        <button
                            onClick={() => setBookTab("BOOK")}
                            className={`px-3 py-1 rounded text-[12px] font-medium transition-colors
                    ${bookTab === "BOOK" ? "bg-raised text-hi" : "text-lo hover:text-mid"}`}
                        >
                            Book
                        </button>
                        <button
                            onClick={() => setBookTab("TRADES")}
                            className={`px-3 py-1 rounded text-[12px] font-medium transition-colors
                    ${bookTab === "TRADES" ? "bg-raised text-hi" : "text-lo hover:text-mid"}`}
                        >
                            Trades
                        </button>
                    </div>
                    <div className="flex-1 min-h-0 overflow-hidden relative">
                        <div className={`absolute inset-0 ${bookTab === "BOOK" ? "block" : "hidden"}`}>
                            <OrderBook bids={bids} asks={asks} config={config} />
                        </div>
                        <div className={`absolute inset-0 ${bookTab === "TRADES" ? "block" : "hidden"}`}>
                            <TradeFeed trades={trades} config={config} />
                        </div>
                    </div>
                </div>


                {/* Right: Order form + Balance */}
                <div className="w-[300px] border-l border-line flex-shrink-0 flex flex-col overflow-y-auto overflow-x-hidden">
                    <OrderForm
                        config={config}
                        onPlaceSubmitted={(draft) => { openOrders.addOptimistic(draft) }}
                        onPlaceAccepted={({ orderId, commandId }) => {
                            openOrders.ackAccepted({ orderId, commandId })
                        }}
                        onPlaceFailed={({ orderId }) => {
                            openOrders.removeByOrderId(orderId)
                        }}
                    />
                    <div className="mt-auto border-t border-line">
                        <BalancePanel />
                    </div>
                    {rejectToast !== null && (
                        <CommandRejectedToast
                            message={rejectToast}
                            onClose={() => setRejectToast(null)}
                        />
                    )}
                </div>
            </div>

            {/*Bottom panel */}
            <div className="border-t border-line overflow-hidden">
                <OpenOrdersPanel
                    config={config}
                    openOrders={openOrders.openOrders}
                />
            </div>

            {showBonusToast && (
                <div className="fixed bottom-6 right-6 z-50 bg-panel border border-accent/30
                    rounded-xl px-5 py-3 shadow-lg flex items-center gap-3">
                    <div>
                        <p className="text-[13px] font-semibold text-hi">₹500 bonus credited!</p>
                        <p className="text-[11px] text-mid">Welcome to Arbitium</p>
                    </div>
                    <button onClick={() => setShowBonusToast(false)} className="text-lo hover:text-hi ml-2">×</button>
                </div>
            )}
        </div>
    )
}
