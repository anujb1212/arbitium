# Arbitium Implementation Plan

## Phase 0: Fix Docker & Database

### Problem

PostgreSQL is not running. The user tried starting a Docker container but Docker daemon isn't accessible, and the local `postgresql.service` is `inactive (dead)`. On top of that, Prisma migration fails with `P1000: Authentication failed` because the `arbitium` user doesn't exist in the database.

### Solution

Two approaches are available:

**Option A** — Start local PostgreSQL (already installed, just needs enabling):
```bash
sudo service postgresql start
```
Then create the `arbitium` user and database, or use the existing `postgres` superuser. Update all `.env` files to match.

**Option B** — Fix Docker and use container:
```bash
# Start Docker daemon
sudo systemctl start docker
# Remove old container if exists
docker rm -f arbitium-postgres 2>/dev/null
# Ensure port 5432 is free
sudo lsof -i :5432
# Start with correct user
docker run -d --name arbitium-postgres \
  -e POSTGRES_USER=arbitium \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=arbitium \
  -p 5432:5432 \
  postgres:latest
```

After either option: run `npx prisma migrate dev` from `libs/db/`.

### DATABASE_URL inconsistencies

| File | Current (wrong) | Fix |
|---|---|---|
| `apps/api-gateway/.env` | `postgresql://postgres:postgres@localhost:5432/arbitium` | → `postgresql://arbitium:postgres@localhost:5432/arbitium` |
| `libs/db/.env` | `postgresql://postgres:postgres@localhost:5432/arbitium` | → `postgresql://arbitium:postgres@localhost:5432/arbitium` |
| `services/data-service/.env` | `postgresql://postgres:postgres@localhost:5432/arbitium` | → `postgresql://arbitium:postgres@localhost:5432/arbitium` |
| `services/market-maker/.env` | `postgresql://postgres:postgres@localhost:5432/arbitium` | → `postgresql://arbitium:postgres@localhost:5432/arbitium` |

All four use `postgres:postgres` as credentials, which won't work with the `arbitium` database user created by Docker Option B.

---

## Phase 1: Switch Backend Market Names to Ticker Symbols

### Problem

The frontend (`market.ts`) defines markets with ticker symbols (`NVDA-INR`, `GOOGL-INR`, `AAPL-INR`, `005930.KS-INR`, etc.). The backend services use company names (`NVIDIA-INR`, `ALPHABET-INR`, `APPLE-INR`, `SAMSUNG-INR`, etc.). Since the frontend sends market names in API requests and WebSocket subscriptions, the backend rejects them as unknown markets.

Additionally, `ws-gateway` and `data-service` still use the old test markets (`TATA-INR, RELIANCE-INR, INFY-INR`) instead of the 30 new ones.

### Solution

Update all backend `.env` files and seed script to use ticker symbols matching the frontend.

### Mapping

```
NVIDIA-INR       → NVDA-INR
ALPHABET-INR     → GOOGL-INR
APPLE-INR        → AAPL-INR
MICROSOFT-INR    → MSFT-INR
AMAZON-INR       → AMZN-INR
TSMC-INR         → TSM-INR
BROADCOM-INR     → AVGO-INR
META-INR         → META-INR
TESLA-INR        → TSLA-INR
SAMSUNG-INR      → 005930.KS-INR
SK-HYNIX-INR     → 000660.KS-INR
TENCENT-INR      → TCEHY-INR
ASML-INR         → ASML-INR
MICRON-INR       → MU-INR
ORACLE-INR       → ORCL-INR
AMD-INR          → AMD-INR
NETFLIX-INR      → NFLX-INR
PALANTIR-INR     → PLTR-INR
CISCO-INR        → CSCO-INR
ALIBABA-INR      → BABA-INR
LAM-RESEARCH-INR → LRCX-INR
INTEL-INR        → INTC-INR
APPLIED-MATERIALS-INR → AMAT-INR
KLA-INR          → KLAC-INR
IBM-INR          → IBM-INR
ARISTA-INR       → ANET-INR
TEXAS-INSTRUMENTS-INR → TXN-INR
ARM-INR          → ARM-INR
SAP-INR          → SAP-INR
ANALOG-DEVICES-INR → ADI-INR
```

### Files to update

| File | What to change |
|------|----------------|
| `apps/engine-ts/.env` | Replace entire `MARKETS=` value with comma-separated ticker symbols |
| `apps/api-gateway/.env` | Same as above |
| `apps/ws-gateway/.env` | Replace `MARKETS=TATA-INR,RELIANCE-INR,INFY-INR` with full 30-market ticker list |
| `services/data-service/.env` | Same as ws-gateway |
| `libs/db/prisma/seed.ts` | Replace `["TATA-INR", "RELIANCE-INR", "INFY-INR"]` with all 30 ticker symbols |
| `services/market-maker/src/config.ts` | Replace `DEFAULT_MID_PRICE_BY_MARKET` keys from company names to ticker symbols |

---

## Phase 2: MarketHeaderBar — Show Ticker + Display Name

### Problem

The `MarketHeaderBar` currently shows only the market symbol (e.g., `NVDA-INR`). A trader can't tell what company this symbol represents without external knowledge. Since the frontend `market.ts` has a `displayName` field (e.g., "NVIDIA"), that information should be visible on the trade page.

### Solution

Add a subtitle/description row below the ticker symbol in `MarketHeaderBar` showing `config.displayName` in a smaller, lower-opacity font. Clean, professional exchange-style header.

**File**: `apps/web-client/src/components/MarketHeaderBar.tsx`

---

## Phase 3: Seed Script Update

### Problem

The seed script (`libs/db/prisma/seed.ts`) hardcodes only 3 old markets: `["TATA-INR", "RELIANCE-INR", "INFY-INR"]`. When the system starts, only these 3 markets have bot inventory (filled orders + trades). The remaining 27 markets have no seeded liquidity, no bot holdings, and no trade history.

### Solution

Replace the 3 hardcoded markets with all 30 ticker-symbol markets. The seed script:
1. Creates/upserts bot user `mm-bot-1` with sufficient balance
2. Creates/upserts counterparty user `mm-seed-counterparty`
3. For each of the 30 markets: creates a filled SELL order (counterparty) + filled BUY order (bot) + a matching Trade record
4. Ensures `mm-bot-1`'s balance covers all 30 markets (sum of per-market price × qty)

### Per-market seed prices

Use realistic approximate INR prices (converted from USD equivalents). Do NOT use a flat ~10000 for all — that over/under-funds the bot balance dramatically.

| Ticker | Seed price (INR, approx) |
|--------|--------------------------|
| NVDA-INR | 12500 |
| GOOGL-INR | 17500 |
| AAPL-INR | 22500 |
| MSFT-INR | 42000 |
| AMZN-INR | 18500 |
| TSM-INR | 16500 |
| AVGO-INR | 10500 |
| META-INR | 9500 |
| TSLA-INR | 11500 |
| 005930.KS-INR | 5500 |
| 000660.KS-INR | 8500 |
| TCEHY-INR | 4500 |
| ASML-INR | 9500 |
| MU-INR | 6500 |
| ORCL-INR | 14000 |
| AMD-INR | 8500 |
| NFLX-INR | 65000 |
| PLTR-INR | 7500 |
| CSCO-INR | 5500 |
| BABA-INR | 7500 |
| LRCX-INR | 6500 |
| INTC-INR | 2500 |
| AMAT-INR | 6500 |
| KLAC-INR | 9500 |
| IBM-INR | 11500 |
| ANET-INR | 16500 |
| TXN-INR | 18500 |
| ARM-INR | 12500 |
| SAP-INR | 22500 |
| ADI-INR | 22500 |

Bot balance = `sum(price × qty)` across all 30 markets + buffer. With qty=10 per market, total ≈ `sum(prices) × 10` ≈ ~500K INR. Allocate 600K INR to `mm-bot-1` for headroom.

**File**: `libs/db/prisma/seed.ts`

---

## Phase 4: Market Maker — Multi-Market Support

### Problem

The market maker runs as a single-market process. The `MARKET` env var (default `TATA-INR`) controls which market it trades. To provide liquidity across all 30 markets, 30 separate processes would be needed.

### Solution

Modify the market maker to handle multiple markets in a single process.

### `config.ts` changes
- Accept comma-separated `MARKETS` env var (default: `NVDA-INR,GOOGL-INR,AAPL-INR`)
- Add mid-price defaults for all 30 ticker-symbol markets using realistic per-market prices (see Phase 3 table — same values)
- Remove single `MARKET` export, export `MARKETS` array

### `index.ts` changes
- Loop over all configured markets
- Maintain `Map<market, PendingOrder[]>` instead of a single `activeOrders` array
- Each refresh cycle:
  1. Cancel all orders across all markets (parallel)
  2. Build and place fresh grids for each market (parallel)
  3. Log per-market summary
- Run all market operations concurrently via `Promise.allSettled`
- **Concurrency cap**: process markets in batches of 5 using a simple `chunk` helper. This prevents overwhelming the engine with 30× grid_size orders simultaneously. Use `Promise.allSettled` per batch, then proceed to next batch.
- Add `REFRESH_INTERVAL_MS` env var (default: 5000) — with 30 markets, refresh cycles take longer; make tunable.

**Files**: `services/market-maker/src/config.ts`, `services/market-maker/src/index.ts`

---

## Phase 5: LandingPage Optimization

### Problem

`LandingMarketPreview` makes **16 HTTP requests** and **1 WebSocket connection with 8 subscriptions** on mount:
- 8 × `fetchTicker(market)` — GET ticker stats
- 8 × `fetchRecentTrades(market)` — GET recent trades
- 1 × WebSocket → subscribes to all 8 markets

These network calls slow down page load and put unnecessary load on the server. The trades data is only needed for the sparkline visualization, which is a secondary visual element.

Additionally, the component has re-render issues:
- `onSelect` is an inline arrow function → new reference every render
- `trades={data?.trades ?? []}` creates a new `[]` reference every render
- No `React.memo` on `LandingMarketRow`, `LandingMarketPanel`, `ChangeCell`, `Sparkline`
- Every WebSocket TRADE event calls `setMarketData` synchronously → React re-renders on every trade

### Solution

### 5.1 Network call reduction

| Action | Keep/Remove | Reason |
|--------|-------------|--------|
| `fetchTicker` (8 calls) | **Keep** | Needed for initial 24h stats (price, change, volume) |
| `fetchRecentTrades` (8 calls) | **Remove** | Trades only needed for sparkline; not critical for landing page |
| WebSocket (1 connection) | **Keep** | Provides real-time price updates via TRADE events |
| WebSocket → Sparkline data | **Deferred** | See Phase 9 — TimescaleDB will provide sparkline data via REST |

### 5.2 Batch WebSocket updates

Accumulate TRADE events in a `useRef` buffer. Flush to React state via `setInterval` every 500ms. This prevents React from re-rendering on every individual trade event.

### 5.3 Sparkline

Keep the SVG-based component as-is. Initially shows `-` placeholder until WebSocket trades arrive. Will be replaced with TimescaleDB-backed data in Phase 9.

### 5.4 Re-render fixes

| Component | Problem | Fix |
|-----------|---------|-----|
| `LandingMarketPreview` | `onSelect` inline arrow → new reference every render | Extract `handleSelect` with `useCallback` |
| `LandingMarketPreview` | `trades={data?.trades ?? []}` → new `[]` | Hoist `EMPTY_TRADES: RecentTrade[] = []` constant |
| `LandingMarketPreview` | `selectedMarketConfig` computed every render | Keep existing `useMemo` |
| `LandingMarketRow` | Re-renders on every parent render | Add `React.memo` |
| `LandingMarketPanel` | Re-renders even when props unchanged | Add `React.memo` |
| `ChangeCell` | No memo, re-renders with parent | Add `React.memo` |
| `Sparkline` | No memo, re-renders with parent | Add `React.memo` |

**Files**:
- `apps/web-client/src/components/LandingMarketPreview.tsx`
- `apps/web-client/src/components/LandingMarketRow.tsx`
- `apps/web-client/src/components/LandingMarketPanel.tsx`
- `apps/web-client/src/components/ChangeCell.tsx`
- `apps/web-client/src/components/Sparkline.tsx`

---

## Phase 6: TradePage Re-render Optimization

### Critical issue #1: `eventCount` causes full-page cascade

**Problem**: `const [eventCount, setEventCount] = useState(0)` with `setEventCount((n) => n + 1)` in `handleEvent`. Every single WebSocket event (BOOK_DELTA, TRADE, COMMAND_REJECTED) updates this state, causing TradePage to re-render completely. Since **no child component uses `React.memo`**, the entire tree (Chart, OrderBook, OrderForm, BottomPanel, MarketSidebar, WalletButton, TradeFeed, MarketHeaderBar) re-renders on every event.

**Solution**: Replace `eventCount` state with `useRef`. The visual status indicator only needs to know "have we received at least one event?" — not a live counter.

### Critical issue #2: `onBonusGranted` causes `fetchTradingBalance()` on every render

**Problem**: `onBonusGranted={() => addToast(...)}` is an inline arrow function in TradePage. WalletButton's `useCallback` for `loadBalance` depends on `onBonusGranted`. Since the inline arrow is a new reference every TradePage render, `loadBalance` is recreated, which causes the initial `useEffect` to re-run `fetchTradingBalance()` on **every single render**.

**Solution**: Wrap in `useCallback`:
```ts
const onBonusGranted = useCallback(
  () => addToast('success', 'Bonus Credited', 'INR 500 added to your account'),
  [addToast]
)
```

### Critical issue #3: `tradeCandles` in Chart deps causes `fetchKlines()` on every trade

**Problem**: Chart klines fetch effect depends on `[config.market, config.priceScale, selectedInterval, tradeCandles]`. The `tradeCandles` useMemo depends on `trades`, which changes on every WebSocket TRADE event. This means every incoming trade triggers a new `fetchKlines()` API call.

**Solution**: Remove `tradeCandles` from the fetch dependency array — klines should only re-fetch when `config.market` or `selectedInterval` changes. **But** keep real-time updates working by using lightweight-charts' `series.update()` API directly on each TRADE event. The Chart should:
1. Fetch klines only on mount / market change / interval change (deps: `[config.market, selectedInterval]`)
2. On each incoming trade, call `candleSeries.update(lastBar)` with the updated last candle — computed in-place from the trade, no API call needed
3. Keep `buildCandlesFromTrades` only for updating the *last* candle, not for re-fetching

This preserves real-time chart updates without the API spam.

### Issue #4: `openOrders` object identity poisons `handleEvent`

**Problem**: `useOpenOrders` returns a new object literal `{ openOrders, addOptimistic, ackAccepted, ... }` every render. `handleEvent`'s `useCallback` depends on this object, so every render creates a new `handleEvent`. This cascades into `useMarketFeed` re-registering the handler.

**Solution**: Wrap the return value of `useOpenOrders` in `useMemo`.

### Issue #5: `stats` object new reference every render

**Problem**: `useMarketStats` returns `{ stats: { lastPrice, direction, ... }, ... }` where `stats` is a plain object literal created every render. This makes `React.memo` on `MarketHeaderBar` ineffective since `stats` is always a new reference.

**Solution**: Wrap `stats` in `useMemo`.

### Issue #6: `toDisplayLevels` creates new arrays/objects every render

**Problem**: `useOrderBook` calls `toDisplayLevels(state.bids, ...)` and `toDisplayLevels(state.asks, ...)` at the return statement. These create brand new `DisplayLevel[]` arrays with new objects every render, even when the underlying order book data hasn't changed.

**Solution**: Wrap both calls in `useMemo`:
```ts
const bids = useMemo(() => toDisplayLevels(state.bids, "BUY", DISPLAY_LEVELS), [state.bids])
const asks = useMemo(() => toDisplayLevels(state.asks, "SELL", DISPLAY_LEVELS), [state.asks])
```

### Issue #7: Unstable callbacks in TradePage

**Problem**: `handleMarketChange`, `onPlaceSubmitted`, `onPlaceAccepted`, `onPlaceFailed` are inline or plain function declarations — new references every render.

**Solution**: Wrap all in `useCallback`.

### Issue #8: No `React.memo` on children

**Problem**: Every child component lacks `React.memo`. Fixing `eventCount` alone won't stop cascade if other state changes (like `selectedMarket` or `bookTab`) cause re-renders.

**Solution**: Add `React.memo` to all child components. **Critical ordering**: `React.memo` with default shallow comparison is useless if object/array props are recreated every render. Issues #4–#6 (useMemo on `openOrders`, `stats`, `bids`/`asks`) and Issue #7 (useCallback on handlers) **must land first** — they guarantee referential stability of the props that `React.memo` compares. Without those upstream fixes, memo never bails out.

| Component | Props to compare | Requires upstream fix |
|-----------|-----------------|----------------------|
| `MarketHeaderBar` | `config`, `stats`, `bestBidPrice`, `bestAskPrice` | Issue #5 (stats useMemo) |
| `OrderBook` | `bids`, `asks`, `config` | Issue #6 (bids/asks useMemo) |
| `BookRow` (inner) | `level`, `side`, `config` | None (primitives) |
| `OrderForm` | `config`, `bestBidPrice`, `bestAskPrice`, callbacks | Issue #7 (useCallback) |
| `BottomPanel` | `config`, `openOrders`, `selectedMarket` | Issue #4 (openOrders useMemo) |
| `TradeFeed` | `trades`, `config` | None if trades is stable ref |
| `MarketSidebar` | `selectedMarket`, `onMarketChange` | Issue #7 (useCallback) |
| `Chart` | `trades`, `lastTradePrice`, `config` | Issue #3 fix |
| `WalletButton` | `onBonusGranted` | Issue #2 (useCallback) |

If any upstream useMemo/useCallback is skipped, the corresponding `React.memo` will never prevent a re-render. Implement Issues #2–#7 before applying Issue #8.

### Issue #9: `renderMarketItem` inline function in MarketSidebar

**Problem**: `renderMarketItem` is defined inside the component body. Every render creates a new function. Called inside `.map()` for every market, generating new onClick handlers.

**Solution**: Extract `MarketItem` as a separate memoized component.

### Issue #10: Filtered/searched markets not memoized

**Problem**: `filteredMarkets`, `favorites`, `indices`, `equities` arrays are derived every render via `.filter()`, creating new array references that cascade to child elements.

**Solution**: Wrap in `useMemo`.

### Files affected

| File | Changes |
|------|---------|
| `apps/web-client/src/pages/TradePage.tsx` | Issue 1, 2, 7 |
| `apps/web-client/src/components/Chart.tsx` | Issue 3, 8 |
| `apps/web-client/src/hooks/useOpenOrders.ts` | Issue 4 |
| `apps/web-client/src/hooks/useMarketStats.ts` | Issue 5 |
| `apps/web-client/src/hooks/useOrderBook.ts` | Issue 6 |
| `apps/web-client/src/components/MarketHeaderBar.tsx` | Issue 8 |
| `apps/web-client/src/components/OrderBook.tsx` | Issue 8 |
| `apps/web-client/src/components/OrderForm.tsx` | Issue 8 |
| `apps/web-client/src/components/BottomPanel.tsx` | Issue 8 |
| `apps/web-client/src/components/TradeFeed.tsx` | Issue 8 |
| `apps/web-client/src/components/MarketSidebar.tsx` | Issue 8, 9, 10 |
| `apps/web-client/src/components/WalletButton.tsx` | Issue 8 |

---

## Phase 7: Chart Cleanup (lightweight-charts Polish)

### Problem

The current Chart works but has:
- **Duplicate price display** — price shown in both Chart header and `MarketHeaderBar`
- **Default TradingView look** — generic dark theme without clear branding
- **No spread/bid-ask context** — the order book is in a separate panel
- **Bulky interval selector** — takes up unnecessary space

### Solution

- Remove the duplicate price from Chart header (keep it in `MarketHeaderBar` only)
- Refine the dark theme: cleaner grid lines, tighter spacing, gradient backgrounds
- Add a compact spread indicator overlay on the price axis
- Polish the interval selector to be more compact and match the UI design system
- Use consistent colors with the order book (green/red for up/down)

**File**: `apps/web-client/src/components/Chart.tsx`

---

## Phase 8: Component Cleanup

### Problem

Several UI elements contribute to code complexity and potential performance issues without adding proportional value.

### Items to address

| Location | Problem | Solution |
|----------|---------|----------|
| `TradePage` grid | Inline style objects created every render (`style={{ gridColumn: ... }}`) on 8+ elements | Extract to CSS module or constants |
| `TradePage` sidebar collapse | `gridTemplateColumns` transition controlled via inline style with JS calculation | CSS class toggle with predefined grid classes |
| `LandingPage` | 30+ absolute-positioned divs for decorative speed trails — high DOM overhead | Reduce to 10–12 higher-impact elements with better z-index management |
| `WalletButton` | `ConnectWalletModal` defined in same file — ~50 lines of inline modal | Extract to `ConnectWalletModal.tsx` |
| `Chart` interval buttons | 5+ inline `onClick` handlers that create new functions | Single handler via `data-interval` attribute |

### Files affected

- `apps/web-client/src/pages/TradePage.tsx`
- `apps/web-client/src/pages/LandingPage.tsx`
- `apps/web-client/src/components/WalletButton.tsx`
- `apps/web-client/src/components/Chart.tsx`

---

## Phase 9: TimescaleDB Integration (Deferred)

See [TIMESCALEDB_PLAN.md](./TIMESCALEDB_PLAN.md) for the full deferred plan.

### Summary

- Convert `Kline` table to TimescaleDB hypertable
- Add `Candle` hypertable for sparkline data
- Use continuous aggregates for hourly/daily candles
- Server-side candle computation (remove `buildCandlesFromTrades`)
- New `/market/sparkline` REST endpoint
- lightweight-charts sparkline fed by TimescaleDB data
- Compression and retention policies for historical data

---

## Execution Order

```
Phase 0: Docker & Database          → Unlocks all development
Phase 1: Ticker symbols             → Frontend-backend alignment
Phase 2: MarketHeaderBar            → UX improvement
Phase 3: Seed script                → Bot liquidity for all markets
Phase 4: Market maker multi-market  → Liquidity automation
Phase 5: LandingPage optimization   → Load time + render perf
Phase 6: TradePage re-renders       → Runtime performance
Phase 7: Chart polish               → UI refinement
Phase 8: Component cleanup          → Code quality
Phase 9: TimescaleDB                → Data infrastructure (future)
```
