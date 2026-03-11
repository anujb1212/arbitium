import React from "react";
import type { MarketConfig } from "../types/market";
import type { MarketStats } from "../hooks/useMarketStats";
import { formatPrice, formatQty } from "../lib/format";
import { formatBpsAsPercent, parseBigIntDecimal } from "../lib/bigint";


type Props = {
    config: MarketConfig;
    stats: MarketStats;
    bestBidPrice: string | null;
    bestAskPrice: string | null;
};

function getDirectionGlyph(direction: MarketStats["direction"]): string {
    if (direction === "UP") return "+";
    if (direction === "DOWN") return "-";
    return "";
}

function getLastPriceColor(direction: MarketStats["direction"]): string {
    if (direction === "UP") return "text-bull";
    if (direction === "DOWN") return "text-bear";
    return "text-hi";
}

function computeSpread(bestBidPrice: string | null, bestAskPrice: string | null): string | null {
    if (!bestBidPrice || !bestAskPrice) return null;
    const bid = parseBigIntDecimal(bestBidPrice);
    const ask = parseBigIntDecimal(bestAskPrice);
    if (ask < bid) return null;
    return (ask - bid).toString();
}

export function MarketHeaderBar(props: Props): React.JSX.Element {
    const { config, stats, bestBidPrice, bestAskPrice } = props;

    const lastPriceText = stats.lastPrice ? formatPrice(stats.lastPrice, config.priceScale) : "—";
    const lastPriceColor = getLastPriceColor(stats.direction);
    const directionGlyph = getDirectionGlyph(stats.direction);

    const changeText = stats.changeBps !== null ? formatBpsAsPercent(stats.changeBps) : "—";
    const changeColor =
        stats.changeBps === null ? "text-mid" : stats.changeBps >= 0n ? "text-bull" : "text-bear";

    const volumeText = stats.windowQtySum ? formatQty(stats.windowQtySum, config.qtyScale) : "—";

    const spreadRaw = computeSpread(bestBidPrice, bestAskPrice);
    const spreadText = spreadRaw ? formatPrice(spreadRaw, config.priceScale) : "—";

    return (
        <div className="bg-panel border-b border-line px-5 py-3">
            <div className="flex items-center justify-between gap-4 w-full">
                <div className="flex flex-col justify-center min-w-[220px]">
                    <div className="text-[11px] text-lo">{config.displayName}</div>
                    <div className={`mt-0.5 text-[22px] leading-none font-semibold ${lastPriceColor}`}>
                        <span className="mr-2 text-[12px] align-middle text-mid">{directionGlyph}</span>
                        <span className="font-mono">{lastPriceText}</span>
                    </div>
                </div>

                <div className="flex gap-8">
                    <div>
                        <div className="text-[11px] text-lo">Change</div>
                        <div className={`text-[13px] font-mono ${changeColor}`}>{changeText}</div>
                        <div className="text-[10px] text-lo/70">Rolling (received)</div>
                    </div>

                    <div>
                        <div className="text-[11px] text-lo">Volume</div>
                        <div className="text-[13px] font-mono text-hi">{volumeText}</div>
                        <div className="text-[10px] text-lo/70">Rolling (received)</div>
                    </div>

                    <div>
                        <div className="text-[11px] text-lo">Spread</div>
                        <div className="text-[13px] font-mono text-hi">{spreadText}</div>
                        <div className="text-[10px] text-lo/70">Best ask - best bid</div>
                    </div>
                </div>
            </div>
        </div>
    );
}