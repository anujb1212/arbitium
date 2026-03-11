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

function getDirectionColor(direction: MarketStats["direction"]): string {
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

type StatCellProps = { label: string; value: string; valueClass?: string }

function StatCell({ label, value, valueClass = "text-hi" }: StatCellProps): React.JSX.Element {
    return (
        <div className="flex flex-col gap-0.5 px-4 border-r border-line last:border-r-0">
            <span className="text-[10px] text-lo leading-none">{label}</span>
            <span className={`text-[13px] font-mono font-medium leading-tight ${valueClass}`}>{value}</span>
        </div>
    )
}

export function MarketHeaderBar(props: Props): React.JSX.Element {
    const { config, stats, bestBidPrice, bestAskPrice } = props;

    const lastPriceText = stats.lastPrice ? formatPrice(stats.lastPrice, config.priceScale) : "—";
    const lastPriceColor = getDirectionColor(stats.direction);
    const changeText = stats.changeBps !== null ? formatBpsAsPercent(stats.changeBps) : "—";
    const changeColor = stats.changeBps === null ? "text-mid" : stats.changeBps >= 0n ? "text-bull" : "text-bear";
    const volumeText = stats.windowQtySum ? formatQty(stats.windowQtySum, config.qtyScale) : "—";
    const spreadRaw = computeSpread(bestBidPrice, bestAskPrice);
    const spreadText = spreadRaw ? formatPrice(spreadRaw, config.priceScale) : "—";

    return (
        <div className="flex items-center h-12 border-b border-line bg-panel flex-shrink-0 overflow-x-auto">
            <div className="flex items-center gap-1.5 px-4 border-r border-line flex-shrink-0">
                <span className="text-[11px] text-lo">{config.displayName}</span>
                <span className={`text-[18px] font-mono font-semibold leading-none ${lastPriceColor}`}>
                    {lastPriceText}
                </span>
            </div>
            <StatCell label="24h Change" value={changeText} valueClass={changeColor} />
            <StatCell label="24h Volume" value={volumeText} />
            <StatCell label="Spread" value={`₹${spreadText}`} />
            <StatCell label="Best Bid" value={bestBidPrice ? formatPrice(bestBidPrice, config.priceScale) : "—"} valueClass="text-bull" />
            <StatCell label="Best Ask" value={bestAskPrice ? formatPrice(bestAskPrice, config.priceScale) : "—"} valueClass="text-bear" />
        </div>
    );
}
