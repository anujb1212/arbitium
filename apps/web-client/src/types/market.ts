export type MarketConfig = {
    market: string;
    displayName: string;
    priceScale: number;
    qtyScale: number;
    tickSize: string;
    lotSize: string;
    currency: string;
};

export const MARKETS: MarketConfig[] = [
    {
        market: "TATA-INR",
        displayName: "Tata Motors",
        priceScale: 2,
        qtyScale: 0,
        tickSize: "5",
        lotSize: "1",
        currency: "INR"
    },
    {
        market: "RELIANCE-INR",
        displayName: "Reliance Industries",
        priceScale: 2,
        qtyScale: 0,
        tickSize: "5",
        lotSize: "1",
        currency: "INR"
    },
    {
        market: "INFY-INR",
        displayName: "Infosys",
        priceScale: 2,
        qtyScale: 0,
        tickSize: "5",
        lotSize: "1",
        currency: "INR"
    }
]

export function getMarketConfig(market: string): MarketConfig | undefined {
    return MARKETS.find((m) => m.market === market);
}
