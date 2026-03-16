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
import { WalletButton } from '../components/WalletButton'
import { TradeFeed } from '../components/TradeFeed'
import { useToast } from '../components/ToastProvider'
import { MarketSidebar } from '../components/MarketSidebar'

export default function TradePage(): React.JSX.Element {
    const { market: marketParam } = useParams<{ market: string }>()
    const navigate = useNavigate()
    const { addToast } = useToast()

    const validMarket = MARKETS.find((m) => m.market === marketParam)?.market ?? MARKETS[0].market

    const [selectedMarket, setSelectedMarket] = useState(validMarket)
    const [eventCount, setEventCount] = useState(0)
    const [bookTab, setBookTab] = useState<'BOOK' | 'TRADES'>('BOOK')

    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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
                addToast('error', 'Command Rejected', event.payload.rejectReason)
            }
        },
        [dispatchDelta, dispatchTrade, onTrade, openOrders, addToast]
    )

    function handleMarketChange(market: string): void {
        setSelectedMarket(market)
        setEventCount(0)
        setIsSidebarOpen(false)
        resetBook(); resetFeed(); resetStats(); openOrders.reset()
        navigate(`/trade/${market}`, { replace: true })
    }

    const { registerCommandId } = useMarketFeed(selectedMarket, handleEvent)

    const config = getMarketConfig(selectedMarket)!
    const bestBidPrice = bids[0]?.price ?? null
    const bestAskPrice = asks[0]?.price ?? null

    return (
        <div
            className="bg-base text-hi font-sans text-[13px]"
            style={{
                display: 'grid',
                gridTemplateColumns: isSidebarOpen ? '250px 1fr 272px 300px' : '0px 1fr 272px 300px',
                gridTemplateRows: '56px 56px 1fr 280px',
                transition: 'grid-template-columns 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                height: '100dvh',
                overflow: 'hidden',
            }}
        >
            {/* Global Header */}
            <header
                style={{ gridColumn: '1 / -1', gridRow: '1' }}
                className="flex items-center justify-between px-5 border-b border-line bg-panel flex-shrink-0 z-30"
            >
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-3 group active:scale-[0.98] transition-all"
                >
                    <img
                        src="/logo.png"
                        alt="Arbitium"
                        className="w-8 h-8 object-cover object-left mix-blend-lighten invert contrast-125 grayscale"
                    />
                    <span className="text-[16px] font-black tracking-tighter text-hi uppercase group-hover:text-mid transition-colors">
                        ARBITIUM
                    </span>
                </button>

                <div className="flex items-center gap-5">
                    <div className={`flex items-center gap-2 text-[11px] font-mono font-bold
                        ${eventCount > 0 ? 'text-bull' : 'text-lo'}`}>
                        <span className={`w-2 h-2 rounded-full flex-shrink-0
                            ${eventCount > 0 ? 'bg-bull animate-pulse' : 'bg-lo'}`} />
                        {eventCount > 0 ? `WS LIVE` : 'CONNECTING...'}
                    </div>
                    <div className="w-px h-4 bg-line" />
                    <WalletButton onBonusGranted={() => addToast('success', 'Bonus Credited', 'INR 500 added to your account')} />
                </div>
            </header>

            {/* Sidebar */}
            <div
                style={{ gridColumn: '1', gridRow: '2 / 5' }}
                className={`flex flex-col min-h-0 overflow-hidden bg-panel transition-colors z-20
                    ${isSidebarOpen ? 'border-r border-line' : ''}`}
            >
                <div className="w-[250px] h-full flex-shrink-0">
                    <MarketSidebar selectedMarket={selectedMarket} onMarketChange={handleMarketChange} />
                </div>
            </div>

            {/* Chart Header Stats */}
            <div
                style={{ gridColumn: '2 / 4', gridRow: '2', zIndex: 10 }}
                className="border-b border-line bg-panel"
            >
                <MarketHeaderBar
                    config={config}
                    stats={stats}
                    bestBidPrice={bestBidPrice}
                    bestAskPrice={bestAskPrice}
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                />
            </div>

            <div
                style={{ gridColumn: '4', gridRow: '2' }}
                className="border-b border-l border-line bg-panel flex items-center px-5"
            >
                <span className="text-[12px] font-bold text-hi uppercase tracking-widest">
                    Trade
                </span>
            </div>

            {/* Chart Area */}
            <div
                style={{ gridColumn: '2', gridRow: '3' }}
                className="flex flex-col min-h-0 overflow-hidden bg-base"
            >
                <Chart trades={trades} lastTradePrice={stats.lastPrice} config={config} />
            </div>

            {/* Orderbook / Trades Area */}
            <div
                style={{ gridColumn: '3', gridRow: '3' }}
                className="border-l border-line flex flex-col min-h-0 overflow-hidden bg-panel"
            >
                <div className="flex items-center gap-1 px-2 py-2 border-b border-line flex-shrink-0 bg-base">
                    {(['BOOK', 'TRADES'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setBookTab(tab)}
                            className={`flex-1 py-1.5 rounded-md text-[11px] font-bold transition-all
                                ${bookTab === tab ? 'bg-raised text-hi shadow-sm' : 'text-lo hover:text-mid'}`}
                        >
                            {tab === 'BOOK' ? 'Order Book' : 'Recent Trades'}
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

            {/* Order Form */}
            <div
                style={{ gridColumn: '4', gridRow: '3 / 5' }}
                className="border-l border-line flex flex-col overflow-y-auto overflow-x-hidden bg-panel"
            >
                <OrderForm
                    config={config}
                    bestBidPrice={bestBidPrice}
                    bestAskPrice={bestAskPrice}
                    onPlaceSubmitted={(draft) => openOrders.addOptimistic(draft)}
                    onPlaceAccepted={({ orderId, commandId }) => {
                        registerCommandId(commandId)
                        openOrders.ackAccepted({ orderId, commandId })
                    }}
                    onPlaceFailed={({ orderId }) => openOrders.removeByOrderId(orderId)}
                />
            </div>

            {/* Bottom Panel */}
            <div
                style={{ gridColumn: '2 / 4', gridRow: '4' }}
                className="border-t border-line overflow-hidden"
            >
                <BottomPanel
                    config={config}
                    openOrders={openOrders.openOrders}
                    selectedMarket={selectedMarket}
                />
            </div>
        </div>
    )
}
