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
                gridTemplateRows: '64px 1fr 280px 32px',
                transition: 'grid-template-columns 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                height: '100dvh',
                overflow: 'hidden',
            }}
        >
            {/* Global Unified Header */}
            <header
                style={{ gridColumn: '1 / -1', gridRow: '1' }}
                className="flex items-center justify-between border-b border-line bg-panel flex-shrink-0 z-30"
            >
                <div className="flex items-center h-full">
                    {/* Fixed width container aligns perfectly with the sidebar */}
                    <div className="w-[250px] flex items-center justify-between px-5 h-full border-r border-line flex-shrink-0">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-3 group active:scale-[0.98] transition-all"
                        >
                            <img
                                src="/logo.png"
                                alt="Arbitium"
                                className="w-6 h-6 object-cover object-left mix-blend-lighten invert contrast-125 grayscale"
                            />
                            <span className="text-[15px] font-black tracking-tighter text-hi uppercase group-hover:text-mid transition-colors">
                                ARBITIUM
                            </span>
                        </button>
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-lo hover:text-hi transition-colors">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                        </button>
                    </div>

                    <MarketHeaderBar
                        config={config}
                        stats={stats}
                        bestBidPrice={bestBidPrice}
                        bestAskPrice={bestAskPrice}
                        onToggleSidebar={() => {}}
                    />
                </div>

                <div className="flex items-center gap-5 px-5">
                    <div className={`flex items-center gap-2 text-[10px] font-mono font-medium tracking-wide ${eventCount > 0 ? 'text-bull' : 'text-lo'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${eventCount > 0 ? 'bg-bull' : 'bg-lo'}`} />
                        {eventCount > 0 ? `CONNECTED` : 'CONNECTING...'}
                    </div>
                    <div className="flex items-center gap-3 border border-line rounded-full pl-3 pr-1 py-1 bg-base">
                        <span className="font-mono tabular-nums text-[12px] font-bold text-hi">-</span>
                        <WalletButton onBonusGranted={() => addToast('success', 'Bonus Credited', 'INR 500 added to your account')} />
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <div
                style={{ gridColumn: '1', gridRow: '2 / 4' }}
                className={`flex flex-col min-h-0 overflow-hidden bg-panel transition-colors z-20 ${isSidebarOpen ? 'border-r border-line' : ''}`}
            >
                <div className="w-[250px] h-full flex-shrink-0">
                    <MarketSidebar selectedMarket={selectedMarket} onMarketChange={handleMarketChange} />
                </div>
            </div>

            {/* Chart Area */}
            <div
                style={{ gridColumn: '2', gridRow: '2' }}
                className="flex flex-col min-h-0 overflow-hidden bg-base"
            >
                <Chart trades={trades} lastTradePrice={stats.lastPrice} config={config} />
            </div>

            {/* Orderbook / Trades Area */}
            <div
                style={{ gridColumn: '3', gridRow: '2' }}
                className="border-l border-line flex flex-col min-h-0 overflow-hidden bg-panel"
            >
                <div className="flex items-center gap-1 px-2 border-b border-line flex-shrink-0 bg-base h-[45px]">
                    {(['BOOK', 'TRADES'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setBookTab(tab)}
                            className={`flex-1 py-1.5 rounded-md text-[11px] font-bold transition-all active:scale-[0.98]
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

            {/* Order Form Area */}
            <div
                style={{ gridColumn: '4', gridRow: '2 / 4' }}
                className="border-l border-line flex flex-col bg-panel overflow-hidden"
            >
                <div className="border-b border-line bg-panel flex items-center px-5 h-[45px] flex-shrink-0">
                    <span className="text-[12px] font-bold text-hi uppercase tracking-widest">
                        Trade
                    </span>
                </div>
                <div className="flex-1 overflow-y-auto overflow-x-hidden">
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
            </div>

            {/* Bottom Panel */}
            <div
                style={{ gridColumn: '2 / 4', gridRow: '3' }}
                className="border-t border-line overflow-hidden bg-panel"
            >
                <BottomPanel
                    config={config}
                    openOrders={openOrders.openOrders}
                    selectedMarket={selectedMarket}
                />
            </div>

            {/* Footer */}
            <div
                style={{ gridColumn: '1 / -1', gridRow: '4' }}
                className="border-t border-line bg-[#090D14] flex items-center justify-between px-4 text-[10px] text-lo font-mono flex-shrink-0 z-30"
            >
                <div className="flex items-center gap-3">
                    <span>MARKET STATUS</span>
                    <div className="flex items-center gap-1.5 text-bull font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-bull" />
                        OPEN
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <span>16:49:23 (UTC+5:30)</span>
                    <div className="flex items-center gap-3">
                        <span className="cursor-pointer hover:text-hi">%</span>
                        <span className="cursor-pointer hover:text-hi">log</span>
                        <span className="cursor-pointer hover:text-hi">auto</span>
                        <svg className="cursor-pointer hover:text-hi" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    </div>
                </div>
            </div>
        </div>
    )
}