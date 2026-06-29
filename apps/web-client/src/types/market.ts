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
    { market: "NVDA-INR", displayName: "NVIDIA", priceScale: 2, qtyScale: 0, tickSize: "5", lotSize: "1", currency: "INR" },
    { market: "GOOGL-INR", displayName: "Alphabet", priceScale: 2, qtyScale: 0, tickSize: "5", lotSize: "1", currency: "INR" },
    { market: "AAPL-INR", displayName: "Apple", priceScale: 2, qtyScale: 0, tickSize: "5", lotSize: "1", currency: "INR" },
    { market: "MSFT-INR", displayName: "Microsoft", priceScale: 2, qtyScale: 0, tickSize: "5", lotSize: "1", currency: "INR" },
    { market: "AMZN-INR", displayName: "Amazon", priceScale: 2, qtyScale: 0, tickSize: "5", lotSize: "1", currency: "INR" },
    { market: "TSM-INR", displayName: "TSMC", priceScale: 2, qtyScale: 0, tickSize: "5", lotSize: "1", currency: "INR" },
    { market: "AVGO-INR", displayName: "Broadcom", priceScale: 2, qtyScale: 0, tickSize: "5", lotSize: "1", currency: "INR" },
    { market: "META-INR", displayName: "Meta", priceScale: 2, qtyScale: 0, tickSize: "5", lotSize: "1", currency: "INR" },
    { market: "TSLA-INR", displayName: "Tesla", priceScale: 2, qtyScale: 0, tickSize: "5", lotSize: "1", currency: "INR" },
    { market: "005930.KS-INR", displayName: "Samsung", priceScale: 2, qtyScale: 0, tickSize: "5", lotSize: "1", currency: "INR" },
    { market: "000660.KS-INR", displayName: "SK Hynix", priceScale: 2, qtyScale: 0, tickSize: "5", lotSize: "1", currency: "INR" },
    { market: "TCEHY-INR", displayName: "Tencent", priceScale: 2, qtyScale: 0, tickSize: "5", lotSize: "1", currency: "INR" },
    { market: "ASML-INR", displayName: "ASML", priceScale: 2, qtyScale: 0, tickSize: "5", lotSize: "1", currency: "INR" },
    { market: "MU-INR", displayName: "Micron", priceScale: 2, qtyScale: 0, tickSize: "5", lotSize: "1", currency: "INR" },
    { market: "ORCL-INR", displayName: "Oracle", priceScale: 2, qtyScale: 0, tickSize: "5", lotSize: "1", currency: "INR" },
    { market: "AMD-INR", displayName: "AMD", priceScale: 2, qtyScale: 0, tickSize: "5", lotSize: "1", currency: "INR" },
    { market: "NFLX-INR", displayName: "Netflix", priceScale: 2, qtyScale: 0, tickSize: "5", lotSize: "1", currency: "INR" },
    { market: "PLTR-INR", displayName: "Palantir", priceScale: 2, qtyScale: 0, tickSize: "5", lotSize: "1", currency: "INR" },
    { market: "CSCO-INR", displayName: "Cisco", priceScale: 2, qtyScale: 0, tickSize: "5", lotSize: "1", currency: "INR" },
    { market: "BABA-INR", displayName: "Alibaba", priceScale: 2, qtyScale: 0, tickSize: "5", lotSize: "1", currency: "INR" },
    { market: "LRCX-INR", displayName: "Lam Research", priceScale: 2, qtyScale: 0, tickSize: "5", lotSize: "1", currency: "INR" },
    { market: "INTC-INR", displayName: "Intel", priceScale: 2, qtyScale: 0, tickSize: "5", lotSize: "1", currency: "INR" },
    { market: "AMAT-INR", displayName: "Applied Materials", priceScale: 2, qtyScale: 0, tickSize: "5", lotSize: "1", currency: "INR" },
    { market: "KLAC-INR", displayName: "KLA", priceScale: 2, qtyScale: 0, tickSize: "5", lotSize: "1", currency: "INR" },
    { market: "IBM-INR", displayName: "IBM", priceScale: 2, qtyScale: 0, tickSize: "5", lotSize: "1", currency: "INR" },
    { market: "ANET-INR", displayName: "Arista", priceScale: 2, qtyScale: 0, tickSize: "5", lotSize: "1", currency: "INR" },
    { market: "TXN-INR", displayName: "Texas Instruments", priceScale: 2, qtyScale: 0, tickSize: "5", lotSize: "1", currency: "INR" },
    { market: "ARM-INR", displayName: "Arm", priceScale: 2, qtyScale: 0, tickSize: "5", lotSize: "1", currency: "INR" },
    { market: "SAP-INR", displayName: "SAP", priceScale: 2, qtyScale: 0, tickSize: "5", lotSize: "1", currency: "INR" },
    { market: "ADI-INR", displayName: "Analog Devices", priceScale: 2, qtyScale: 0, tickSize: "5", lotSize: "1", currency: "INR" },
];

export function getMarketConfig(market: string): MarketConfig | undefined {
    return MARKETS.find((m) => m.market === market);
}
