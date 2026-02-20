import React, { useState, useCallback } from "react";
import { MARKETS, getMarketConfig } from "./types/market";
import type { WireEventEnvelope } from "./types/wire";
import { useMarketFeed } from "./ws/useMarketFeed";
import "./styles/global.css";

export default function App(): React.JSX.Element {
    const [selectedMarket, setSelectedMarket] = useState(MARKETS[0].market);
    const [eventCount, setEventCount] = useState(0);

    const handleEvent = useCallback((event: WireEventEnvelope): void => {
        setEventCount((n) => n + 1);
        console.debug("[arbitium:feed]", event.kind, event);
    }, []);

    useMarketFeed(selectedMarket, handleEvent);

    const config = getMarketConfig(selectedMarket);

    return (
        <div className="app-shell">
            <header className="app-header">
                <span className="app-logo">Arbitium</span>
                <nav className="market-nav">
                    {MARKETS.map((m) => (
                        <button
                            key={m.market}
                            className={`market-tab${selectedMarket === m.market ? " active" : ""}`}
                            onClick={() => setSelectedMarket(m.market)}
                        >
                            {m.market}
                        </button>
                    ))}
                </nav>
                <span className={`connection-status${eventCount > 0 ? " live" : ""}`}>
                    {eventCount > 0 ? `● Live · ${eventCount} events` : "○ Connecting…"}
                </span>
            </header>

            <main className="app-main">
                <p>{config?.displayName}</p>
            </main>
        </div>
    );
}
