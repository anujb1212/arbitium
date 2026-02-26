import React from 'react'
import { useNavigate } from 'react-router-dom'
import { MARKETS } from '../types/market'
import { clearToken, isLoggedIn, redirectToVaultlyLogin } from '../lib/auth'

export default function LandingPage(): React.JSX.Element {
    const navigate = useNavigate()
    const loggedIn = isLoggedIn()

    return (
        <div className="min-h-screen bg-base text-hi font-sans selection:bg-accent/30">
            <header className="absolute top-0 w-full z-50 h-16 flex items-center justify-between px-8">
                <span className="text-[17px] font-bold tracking-tight text-hi">Arbitium</span>
                <nav className="flex items-center gap-6">
                    {loggedIn ? (
                        <button
                            onClick={() => { clearToken(); window.location.reload() }}
                            className="text-[13px] font-medium text-mid hover:text-hi transition-colors"
                        >
                            Sign out
                        </button>
                    ) : (
                        <button
                            onClick={redirectToVaultlyLogin}
                            className="text-[13px] font-medium text-hi bg-raised hover:bg-line border border-line px-4 py-1.5 rounded-full transition-colors"
                        >
                            Sign in with Vaultly
                        </button>
                    )}
                    <button
                        onClick={() => navigate(`/trade/${MARKETS[0].market}`)}
                        className="text-[13px] font-medium text-hi bg-raised hover:bg-line border border-line px-4 py-1.5 rounded-full transition-colors"
                    >
                        Launch Trading
                    </button>
                </nav>
            </header>

            <main className="flex flex-col items-center justify-center pt-40 pb-20 px-6 max-w-5xl mx-auto text-center">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1] mb-6">
                    Exchange-grade precision.<br />
                    <span className="text-mid">Zero compromises.</span>
                </h1>

                <p className="text-lg md:text-xl text-mid max-w-2xl leading-relaxed mb-16">
                    A deterministic matching engine built from the ground up for Indian Equities.
                    Strict price-time priority.
                </p>

                <div className="w-full text-left">
                    <p className="text-[12px] font-semibold text-lo uppercase tracking-widest mb-6 px-2">
                        Select a Market
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {MARKETS.map((m) => (
                            <button
                                key={m.market}
                                onClick={() => navigate(`/trade/${m.market}`)}
                                className="group relative flex flex-col items-start p-6 bg-panel border border-line rounded-2xl hover:border-mid/50 hover:bg-raised transition-all duration-300 active:scale-[0.98] text-left overflow-hidden"
                            >
                                <div className="flex items-center justify-between w-full mb-8">
                                    <div className="w-10 h-10 rounded-full bg-base border border-line flex items-center justify-center text-[13px] font-bold text-hi group-hover:border-mid/50 transition-colors">
                                        {m.market.slice(0, 1)}
                                    </div>
                                    <span className="text-lo group-hover:text-hi transition-colors">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                            <polyline points="12 5 19 12 12 19"></polyline>
                                        </svg>
                                    </span>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-hi mb-1">{m.displayName}</h3>
                                    <p className="text-[13px] font-mono text-mid">{m.market}</p>
                                </div>

                                <div className="absolute -inset-px bg-gradient-to-br from-accent/0 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
                            </button>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}
