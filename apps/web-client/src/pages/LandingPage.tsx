import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronRight } from 'lucide-react'


import { RealisticChart } from '../components/RealisticChart'
import { MetricsRow } from '../components/MetricsRow'
import { MarketOverviewTable } from '../components/MarketOverviewTable'
import { fetchRecentTrades, fetchTicker, RecentTrade, TickerSnapshot } from '../lib/apiClient'
import { clearToken, isLoggedIn, redirectToVaultlyLogin } from '../lib/auth'
import { MARKETS } from '../types/market'

export type MarketData = { ticker: TickerSnapshot | null; trades: RecentTrade[] }

export default function LandingPage(): React.JSX.Element {
    const navigate = useNavigate()
    const loggedIn = isLoggedIn()
    const [marketData, setMarketData] = useState<Map<string, MarketData>>(new Map())

    useEffect(() => {
        Promise.all(
            MARKETS.map(async (m): Promise<[string, MarketData]> => {
                const [ticker, trades] = await Promise.all([
                    fetchTicker(m.market).catch(() => null),
                    fetchRecentTrades(m.market).catch(() => [] as RecentTrade[])
                ])
                return [m.market, { ticker, trades }]
            })
        ).then((entries) => setMarketData(new Map(entries)))
    }, [])

    return (
        <div className="min-h-screen bg-base text-hi font-sans selection:bg-accent/30 flex flex-col">
            <header className="w-full h-[72px] flex items-center justify-between px-8 bg-base sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <span className="text-[20px] font-black tracking-tight text-hi uppercase flex items-center gap-1">
                        <span className="text-accent text-[22px]">AR</span>BITIUM
                    </span>
                </div>
                <nav className="hidden md:flex items-center gap-8 text-[13px] font-bold text-lo">
                    <button className="text-hi transition-colors">Trading</button>
                    <button className="hover:text-hi transition-colors">Markets</button>
                    <button className="hover:text-hi transition-colors">Pricing</button>
                    <button className="hover:text-hi transition-colors flex items-center gap-1">Resources <ChevronRight size={14} className="rotate-90 opacity-70" /></button>
                    <button className="hover:text-hi transition-colors">About</button>
                </nav>
                <div className="flex items-center gap-4">
                    {loggedIn ? (
                        <button onClick={() => { clearToken(); window.location.reload() }} className="text-[13px] font-bold text-lo hover:text-hi transition-colors px-4 py-2 border border-line rounded-[4px]">
                            Log out
                        </button>
                    ) : (
                        <button onClick={redirectToVaultlyLogin} className="text-[13px] font-bold text-lo hover:text-hi transition-colors px-4 py-2 rounded-[4px] border border-line">
                            Log in
                        </button>
                    )}
                    <button onClick={() => navigate(`/trade/${MARKETS[0].market}`)} className="text-[13px] font-bold bg-accent text-white hover:bg-accent/90 px-5 py-2 rounded-[4px] transition-colors flex items-center gap-2">
                        Launch Terminal <ArrowRight size={14} />
                    </button>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-start pt-20 pb-24 px-6 max-w-[1500px] mx-auto w-full">

                <div className="w-full grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-center mb-24">
                    <div className="flex flex-col items-start pr-4">
                        <div className="flex items-center gap-2 mb-8 px-4 py-1.5 border border-line bg-raised rounded-sm text-[11px] font-bold text-mid tracking-wider uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                            BUILT FOR PROFESSIONALS
                        </div>
                        <h1 className="text-[64px] xl:text-[84px] font-black tracking-tight leading-[1] mb-8 text-hi">
                            High-Frequency <br /> Trading <br />
                            <span className="text-accent">Made Accessible.</span>
                        </h1>
                        <p className="text-[18px] xl:text-[20px] text-lo font-medium leading-relaxed mb-12 max-w-[480px]">
                            A deterministic matching engine. Experience millisecond execution with institutional-grade tools.
                        </p>
                        <div className="flex items-center gap-6">
                            <button onClick={() => navigate(`/trade/${MARKETS[0].market}`)} className="bg-accent text-white font-bold text-[15px] px-8 py-4 rounded-[4px] transition-all hover:bg-accent/90 flex items-center gap-2 shadow-lg shadow-accent/20">
                                Launch Terminal <ArrowRight size={18} />
                            </button>
                            <button className="bg-transparent text-hi font-bold text-[15px] px-4 py-4 transition-all flex items-center gap-2 group">
                                Explore features <ChevronRight size={18} className="text-lo group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    <div className="w-full flex items-center justify-center lg:pl-12">
                        <RealisticChart />
                    </div>
                </div>

                <MetricsRow />

                <MarketOverviewTable marketData={marketData} />

            </main>
        </div>
    )
}