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
import { BottomPanel } from '../components/BottomPanel'
import { CommandRejectedToast } from '../components/CommandRejectedToast'
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
    const [bookTab, setBookTab] = useState<'BOOK' | 'TRADES'>('BOOK')

    const { bids, asks, dispatchDelta, resetBook, seedBook } = useOrderBook()
    const { trades, dispatchTrade, resetFeed, seedFeed } = useTradeFeed()
    const { stats, onTrade, seedStats, reset: resetStats } = useMarketStats()
    const openOrders = useOpenOrders()

    useEffect(() => {
        let cancelled = false
        fetchDepth(selectedMarket).then((s) => { if (!cancelled) seedBook(s) }).catch(() => { })
        fetchRecentTrades(selectedMarket).then((t) => { if (!cancelled) seedFeed(t) }).catch(() => { })
        fetchTicker(selectedMarket).then((t) => { if (!cancelled) seedStats(t) }).catch(() => { })
        fetchOpenOrders(selectedMarket).then((o) => { if (!cancelled) openOrders.seedFromDB(o) }).catch(() => { })
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
                if (event.commandId) openOrders.removeByCommandId(event.commandId)
                setRejectToast(event.payload.rejectReason)
            }
        },
        [dispatchDelta, dispatchTrade, onTrade, openOrders]
    )

    function handleMarketChange(market: string): void {
        setSelectedMarket(market)
        setEventCount(0)
        setRejectToast(null)
        resetBook(); resetFeed(); resetStats(); openOrders.reset()
        navigate(`/trade/${market}`, { replace: true })
    }

    useMarketFeed(selectedMarket, handleEvent)

    const config = getMarketConfig(selectedMarket)!
    const bestBidPrice = bids[0]?.price ?? null
    const bestAskPrice = asks[0]?.price ?? null

    return (
        <div
            className="bg-base text-hi font-sans text-[13px]"
            style={{
                display: 'grid',
                gridTemplateColumns: '1fr 272px 300px',
                gridTemplateRows: '56px 52px 1fr 260px',
                height: '100dvh',
                overflow: 'hidden',
            }}
        >
            <header
                style={{ gridColumn: '1 / -1', gridRow: '1' }}
                className="flex items-center justify-between px-6 border-b border-line bg-panel flex-shrink-0"
            >
                <button
                    onClick={() => navigate('/')}
                    className="text-[18px] font-bold tracking-tight text-hi hover:text-mid transition-colors flex-shrink-0"
                >
                    Arbitium
                </button>

                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-1.5 text-[11px] font-mono
                        ${eventCount > 0 ? 'text-bull' : 'text-lo'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0
                            ${eventCount > 0 ? 'bg-bull animate-pulse' : 'bg-lo'}`} />
                        {eventCount > 0 ? `Live · ${eventCount}` : 'Connecting…'}
                    </div>
                    <WalletButton onBonusGranted={() => setShowBonusToast(true)} />
                </div>
            </header>

            <div
                style={{ gridColumn: '1 / 3', gridRow: '2', zIndex: 20, position: 'relative' }}
                className="border-b border-line"
            >
                <MarketHeaderBar
                    config={config}
                    stats={stats}
                    bestBidPrice={bestBidPrice}
                    bestAskPrice={bestAskPrice}
                    onMarketChange={handleMarketChange}
                />
            </div>

            <div
                style={{ gridColumn: '3', gridRow: '2' }}
                className="border-b border-l border-line bg-panel flex items-center px-4"
            >
                <span className="text-[11px] font-semibold text-lo uppercase tracking-widest">
                    Place Order
                </span>
            </div>

            <div
                style={{ gridColumn: '1', gridRow: '3' }}
                className="flex flex-col min-h-0 overflow-hidden"
            >
                <Chart trades={trades} lastTradePrice={stats.lastPrice} config={config} />
            </div>

            <div
                style={{ gridColumn: '2', gridRow: '3' }}
                className="border-l border-line flex flex-col min-h-0 overflow-hidden bg-panel"
            >
                <div className="flex items-center gap-1 px-2 py-1.5 border-b border-line flex-shrink-0">
                    {(['BOOK', 'TRADES'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setBookTab(tab)}
                            className={`px-3 py-1 rounded text-[12px] font-medium transition-colors
                                ${bookTab === tab ? 'bg-raised text-hi' : 'text-lo hover:text-mid'}`}
                        >
                            {tab === 'BOOK' ? 'Book' : 'Trades'}
                        </button>
                    ))}
                </div>
                <div className="flex-1 min-h-0 overflow-hidden relative">
                    <div className={`absolute inset-0 ${bookTab === 'BOOK' ? 'block' : 'hidden'}`}>
                        <OrderBook bids={bids} asks={asks} config={config} />
                    </div>
                    <div className={`absolute inset-0 ${bookTab === 'TRADES' ? 'block' : 'hidden'}`}>
                        <TradeFeed trades={trades} config={config} />
                    </div>
                </div>
            </div>

            <div
                style={{ gridColumn: '3', gridRow: '3 / 5' }}
                className="border-l border-line flex flex-col overflow-y-auto overflow-x-hidden bg-panel"
            >
                <OrderForm
                    config={config}
                    bestBidPrice={bestBidPrice}
                    bestAskPrice={bestAskPrice}
                    onPlaceSubmitted={(draft) => openOrders.addOptimistic(draft)}
                    onPlaceAccepted={({ orderId, commandId }) =>
                        openOrders.ackAccepted({ orderId, commandId })}
                    onPlaceFailed={({ orderId }) => openOrders.removeByOrderId(orderId)}
                />
                {rejectToast !== null && (
                    <CommandRejectedToast
                        message={rejectToast}
                        onClose={() => setRejectToast(null)}
                    />
                )}
            </div>

            <div
                style={{ gridColumn: '1 / 3', gridRow: '4' }}
                className="border-t border-line overflow-hidden"
            >
                <BottomPanel
                    config={config}
                    openOrders={openOrders.openOrders}
                    selectedMarket={selectedMarket}
                />
            </div>

            {showBonusToast && (
                <div className="fixed bottom-6 right-6 z-50 bg-panel border border-accent/30
                    rounded-xl px-5 py-3 shadow-2xl flex items-center gap-4">
                    <div>
                        <p className="text-[13px] font-semibold text-hi">₹500 bonus credited!</p>
                        <p className="text-[11px] text-mid">Welcome to Arbitium</p>
                    </div>
                    <button
                        onClick={() => setShowBonusToast(false)}
                        className="text-lo hover:text-hi text-xl leading-none"
                    >
                        ×
                    </button>
                </div>
            )}
        </div>
    )
}
