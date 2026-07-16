import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { LandingMarketPreview } from '../components/LandingMarketPreview'
import { clearToken, isLoggedIn, redirectToVaultlyLogin } from '../lib/auth'
import { MARKETS } from '../types/market'

export default function LandingPage(): React.JSX.Element {
    const navigate = useNavigate()
    const loggedIn = isLoggedIn()

    return (
        <div className="min-h-screen bg-base text-hi font-sans selection:bg-accent/30 flex flex-col overflow-x-hidden relative">
            {/* Background Ambient Trails & Glow (Global) */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex justify-center">
                <div className="w-full max-w-[1600px] relative h-full">
                    {/* Reddish & Blue Gradient Glows */}
                    <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-red-500/10 blur-[150px] rounded-full mix-blend-screen" />
                    <div className="absolute top-[50%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-500/10 blur-[150px] rounded-full mix-blend-screen" />
                    
                    {/* --- THICK, DENSE SPEED TRAILS --- */}
                    
                    {/* Hero Section (Top) */}
                    <div className="absolute top-[12%] left-[5%] w-[15%] h-[6px] bg-gradient-to-r from-transparent to-purple-500 rounded-full shadow-[15px_0_30px_10px_rgba(168,85,247,0.8)]" />
                    <div className="absolute top-[18%] right-[8%] w-[18%] h-[8px] bg-gradient-to-l from-transparent to-blue-500 rounded-full shadow-[-15px_0_40px_12px_rgba(59,130,246,0.9)]" />
                    <div className="absolute top-[28%] right-[15%] w-[22%] h-[6px] bg-gradient-to-l from-transparent to-cyan-400 rounded-full shadow-[-15px_0_35px_10px_rgba(34,211,238,0.8)]" />
                    
                    {/* Mid Section */}
                    <div className="absolute top-[35%] left-[-2%] w-[25%] h-[10px] bg-gradient-to-r from-transparent to-blue-400 rounded-full shadow-[20px_0_50px_15px_rgba(96,165,250,0.9)]" />
                    <div className="absolute top-[40%] right-[-5%] w-[30%] h-[8px] bg-gradient-to-l from-transparent to-purple-600 rounded-full shadow-[-20px_0_45px_12px_rgba(147,51,234,0.8)]" />
                    <div className="absolute top-[48%] right-[20%] w-[12%] h-[5px] bg-gradient-to-l from-transparent to-blue-500 rounded-full shadow-[-15px_0_25px_8px_rgba(59,130,246,0.7)]" />
                    
                    {/* Lower Mid */}
                    <div className="absolute top-[55%] left-[18%] w-[22%] h-[8px] bg-gradient-to-r from-transparent to-cyan-400 rounded-full shadow-[20px_0_45px_12px_rgba(34,211,238,0.8)]" />
                    <div className="absolute top-[62%] right-[10%] w-[28%] h-[10px] bg-gradient-to-l from-transparent to-purple-500 rounded-full shadow-[-20px_0_50px_15px_rgba(168,85,247,0.9)]" />
                    <div className="absolute top-[68%] left-[5%] w-[18%] h-[6px] bg-gradient-to-r from-transparent to-blue-600 rounded-full shadow-[15px_0_35px_10px_rgba(37,99,235,0.8)]" />
                    
                    {/* Bottom Section */}
                    <div className="absolute top-[80%] left-[-5%] w-[35%] h-[10px] bg-gradient-to-r from-transparent to-blue-500 rounded-full shadow-[25px_0_60px_18px_rgba(59,130,246,0.9)]" />
                    <div className="absolute top-[92%] left-[15%] w-[18%] h-[6px] bg-gradient-to-r from-transparent to-purple-500 rounded-full shadow-[15px_0_30px_10px_rgba(168,85,247,0.7)]" />
                    <div className="absolute top-[96%] right-[12%] w-[14%] h-[5px] bg-gradient-to-l from-transparent to-blue-400 rounded-full shadow-[-15px_0_25px_8px_rgba(96,165,250,0.8)]" />
                </div>
            </div>

            <header className="w-full h-[72px] flex items-center justify-between px-6 md:px-12 bg-base/80 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <span className="text-[20px] font-black tracking-tight text-hi uppercase flex items-center gap-1">
                        <span className="text-accent text-[22px]">AR</span>BITIUM
                    </span>
                </div>
                <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-lo">
                    <button className="text-hi font-bold transition-colors">Trading</button>
                    <button className="hover:text-hi transition-colors">Markets</button>
                    <button className="hover:text-hi transition-colors">Pricing</button>
                    <button className="hover:text-hi transition-colors flex items-center gap-1">Resources <ChevronRight size={14} className="rotate-90 opacity-70" /></button>
                    <button className="hover:text-hi transition-colors">About</button>
                </nav>
                <div className="flex items-center gap-4">
                    {loggedIn ? (
                        <button onClick={() => { clearToken(); window.location.reload() }} className="text-[13px] font-bold text-lo hover:text-hi transition-colors px-4 py-2 border border-line rounded-lg">
                            Log out
                        </button>
                    ) : (
                        <button onClick={redirectToVaultlyLogin} className="text-[13px] font-bold text-hi bg-panel hover:bg-raised transition-colors px-4 py-2 rounded-lg border border-line">
                            Log in
                        </button>
                    )}
                    <button onClick={() => navigate(`/trade/${MARKETS[0].market}`)} className="text-[13px] font-bold bg-white text-base hover:bg-white/90 px-5 py-2 rounded-lg transition-colors flex items-center gap-2">
                        Start Trading <ArrowRight size={14} />
                    </button>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-start pt-24 pb-32 px-6 max-w-[1400px] mx-auto w-full text-center relative z-10">
                
                {/* Hero Section */}
                <div className="flex flex-col items-center max-w-[800px] mx-auto mb-20 animate-in slide-in-from-bottom-4 fade-in duration-700 ease-out fill-mode-both">
                    <div className="flex items-center gap-2 mb-6 px-4 py-1.5 border border-line bg-panel rounded-full text-[12px] font-bold text-hi tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                        Real-time markets
                    </div>
                    <h1 className="text-[56px] md:text-[72px] font-medium tracking-tight leading-[1.05] mb-6 text-hi">
                        The modern capital platform.
                        <br />
                        <span className="text-lo">Trade markets as they move.</span>
                    </h1>
                    <p className="text-[18px] md:text-[20px] text-lo font-medium leading-relaxed mb-10 max-w-[600px]">
                        Real-time prices, responsive order books, and a deterministic trading experience built for clarity without dilution.
                    </p>
                    <div className="flex items-center justify-center gap-6">
                        <button onClick={() => navigate(`/trade/${MARKETS[0].market}`)} className="bg-white text-base font-bold text-[15px] px-8 py-4 rounded-full transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-xl shadow-white/10">
                            Start Now <ArrowRight size={18} />
                        </button>
                    </div>
                    <p className="mt-4 text-[13px] text-lo flex items-center justify-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                        Deterministic matching engine
                    </p>
                </div>

                {/* Live Terminal Preview */}
                <div className="w-full relative animate-in slide-in-from-bottom-8 fade-in duration-700 delay-300 ease-out fill-mode-both">
                    <LandingMarketPreview />
                </div>
            </main>
        </div>
    )
}