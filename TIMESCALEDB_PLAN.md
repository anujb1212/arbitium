# TimescaleDB Integration Plan

## Problem

The current PostgreSQL setup stores market data (klines/candles) in a standard relational `Kline` table. As trade volume grows, queries for sparkline data and historical candles become slow because:

1. **No time-series optimization** — queries scan full tables instead of chunk-pruning
2. **No compression** — historical data grows unbounded
3. **No continuous aggregates** — candle computation happens client-side in the frontend (`buildCandlesFromTrades` in Chart.tsx)
4. **No dedicated sparkline data** — LandingMarketRow derives sparklines from raw trade arrays (inefficient for 8 markets)

## Solution

Replace standard PostgreSQL with TimescaleDB (a PostgreSQL extension). TimescaleDB is fully compatible with Prisma and requires no code changes to the application layer — just schema additions and migration SQL.

---

## 1. Infrastructure

### 1.1 Docker container

| Current | Target |
|---------|--------|
| `postgres:latest` | `timescale/timescaledb:latest-pg17` |

```bash
docker rm -f arbitium-postgres
docker run -d --name arbitium-postgres \
  -e POSTGRES_USER=arbitium \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=arbitium \
  -p 5433:5432 \
  timescale/timescaledb:latest-pg17
```

Port 5433 avoids collision with the Windows-side postgres that WSL2's localhost forwarding intercepts on 5432. Update `DATABASE_URL` in all 4 `.env` files:

```bash
sed -i 's/localhost:5432/localhost:5433/g' libs/db/.env apps/api-gateway/.env services/data-service/.env services/market-maker/.env
```

### 1.2 Prisma compatibility

TimescaleDB is a PostgreSQL extension. Prisma works transparently for:
- `CREATE TABLE` (model definitions)
- `INSERT`, `UPDATE`, `SELECT`, `DELETE`

Hypertable conversion and compression policies require raw SQL (not Prisma migrations). Use `prisma migrate dev --create-only` to generate the migration, append raw SQL, then `prisma migrate dev` to apply atomically — avoids schema drift.

### 1.3 Data preservation

Existing `Trade`/`Kline` data will be lost on image switch. Either:
- `pg_dump` the current database → restore into TimescaleDB container, or
- Accept data loss and re-seed (30 markets are re-created by seed script + market maker anyway)

---

## 2. Schema Changes

### 2.1 Fix existing `Kline` table for hypertable compatibility

TimescaleDB requires all unique constraints/PKs to include the partition column (`openTime`). The current Kline PK likely doesn't include it.

**Prisma schema fix** (before hypertable conversion):
```prisma
model Kline {
  // Remove any standalone @id field — use composite PK
  market     String
  interval   String
  openTime   DateTime
  closeTime  DateTime
  open       BigInt
  high       BigInt
  low        BigInt
  close      BigInt
  volume     BigInt
  tradeCount Int

  @@id([market, interval, openTime])
}
```

**Hypertable SQL** (with `migrate_data` for existing rows):
```sql
SELECT create_hypertable('"Kline"', 'openTime',
  chunk_time_interval => INTERVAL '1 day',
  migrate_data => TRUE
);

ALTER TABLE "Kline" SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'market, interval',
  timescaledb.compress_orderby = '"openTime" DESC'
);

SELECT add_compression_policy('"Kline"', INTERVAL '7 days');
```

### 2.2 Add `Candle` table (new model in schema.prisma)

**Purpose**: Dedicated hypertable for sparkline and sub-minute candle data. Uses composite PK (no standalone `id`) so hypertable creation succeeds.

```prisma
model Candle {
  market      String
  resolution  String   // '1m', '5m', '15m', '1h'
  openTime    DateTime
  closeTime   DateTime
  open        BigInt
  high        BigInt
  low         BigInt
  close       BigInt
  volume      BigInt   @default(0)
  tradeCount  Int      @default(0)

  @@id([market, resolution, openTime])
  @@index([market, resolution, openTime])
}
```

**Migration SQL** (appended to the same Prisma migration):
```sql
SELECT create_hypertable('"Candle"', 'openTime', chunk_time_interval => INTERVAL '1 day');

ALTER TABLE "Candle" SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'market, resolution',
  timescaledb.compress_orderby = '"openTime" DESC'
);

SELECT add_compression_policy('"Candle"', INTERVAL '7 days');
SELECT add_retention_policy('"Candle"', INTERVAL '90 days');
```

### 2.3 Continuous aggregates

**Critical**: Always filter to a single resolution to avoid mixing candle intervals in aggregates.

**Hourly candles** (from 1m Candles only):
```sql
CREATE MATERIALIZED VIEW "CandleHourly"
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 hour', "openTime") AS bucket,
  market,
  FIRST(open, "openTime") AS open,
  MAX(high) AS high,
  MIN(low) AS low,
  LAST(close, "openTime") AS close,
  SUM(volume) AS volume,
  SUM("tradeCount") AS trade_count
FROM "Candle"
WHERE resolution = '1m'
GROUP BY bucket, market
WITH NO DATA;

SELECT add_continuous_aggregate_policy('"CandleHourly"',
  start_offset => INTERVAL '3 days',
  end_offset => INTERVAL '1 hour',
  schedule_interval => INTERVAL '1 hour'
);
```

**Daily candles** (from raw `Candle`, NOT from `CandleHourly` — cagg-on-cagg can't reference source table columns like `openTime`):
```sql
CREATE MATERIALIZED VIEW "CandleDaily"
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 day', "openTime") AS bucket,
  market,
  FIRST(open, "openTime") AS open,
  MAX(high) AS high,
  MIN(low) AS low,
  LAST(close, "openTime") AS close,
  SUM(volume) AS volume,
  SUM("tradeCount") AS trade_count
FROM "Candle"
WHERE resolution = '1m'
GROUP BY bucket, market
WITH NO DATA;

SELECT add_continuous_aggregate_policy('"CandleDaily"',
  start_offset => INTERVAL '7 days',
  end_offset => INTERVAL '1 day',
  schedule_interval => INTERVAL '1 day'
);
```

---

## 3. Data Service Changes

### 3.1 `eventHandler.ts` — Dual write on TRADE

**Problem**: Currently only writes to `Trade` table. Candle computation happens client-side.

**Solution**: When processing a TRADE event, upsert into both `Trade` (existing) and `Candle` (new). Must update `closeTime` on conflict.

```typescript
// New: upsert 1m candle
// Column names must match Prisma's generated schema (camelCase, quoted)
await prisma.$executeRaw`
  INSERT INTO "Candle" (market, resolution, "openTime", "closeTime", open, high, low, close, volume, "tradeCount")
  VALUES (${market}, '1m', ${openTime}, ${closeTime}, ${price}, ${price}, ${price}, ${price}, ${qty}, 1)
  ON CONFLICT (market, resolution, "openTime") DO UPDATE SET
    high = GREATEST("Candle".high, ${price}),
    low = LEAST("Candle".low, ${price}),
    close = ${price},
    "closeTime" = ${closeTime},
    volume = "Candle".volume + ${qty},
    "tradeCount" = "Candle"."tradeCount" + 1;
`;
```

### 3.2 `klineService.ts` — Read from hypertables

**Problem**: Kline queries scan full table, no server-side aggregation.

**Solution**: 
- For intervals ≥ 1h: query continuous aggregate views (`CandleHourly`, `CandleDaily`)
- For intervals < 1h: query raw `Candle` table with `time_bucket()`
- Leverage `first()`/`last()` aggregates for OHLC computation

---

## 4. API Gateway Changes

### 4.1 New endpoint: `GET /market/sparkline`

**Problem**: No dedicated sparkline endpoint. Frontend computes sparkline from raw trades.

**Solution**: Single endpoint accepting one market, consistent time units in milliseconds.
```
GET /market/sparkline?market=NVDA-INR&from=1710600000000&to=1710686400000
```
Response (all times in **milliseconds**):
```json
{
  "market": "NVDA-INR",
  "resolution": "1m",
  "candles": [
    { "time": 1710600000000, "open": "15000", "high": "15100", "low": "14980", "close": "15050" }
  ]
}
```

### 4.2 Batch sparkline endpoint: `POST /market/sparklines`

**Problem**: Landing page needs sparklines for 8 markets — 8 separate HTTP requests is wasteful.

**Solution**: Single batched request for all preview markets.
```
POST /market/sparklines
Content-Type: application/json

{ "markets": ["NVDA-INR", "AAPL-INR", "TSLA-INR", ...], "from": 1710600000000, "to": 1710686400000 }
```
Response:
```json
{
  "sparklines": {
    "NVDA-INR": [{ "time": 1710600000000, "open": "15000", "high": "15100", "low": "14980", "close": "15050" }],
    "AAPL-INR": [{ "time": 1710600000000, "open": "22000", "high": "22100", "low": "21980", "close": "22050" }]
  }
}
```

### 4.3 Optimize `GET /market/klines`

- Query continuous aggregates for larger intervals (instant)
- Add `limit` parameter for pagination
- Remove client-side aggregation dependency

---

## 5. Frontend Changes

### 5.1 `Sparkline` component — TimescaleDB data source

**Problem**: SVG sparkline derived from raw trade arrays received via WebSocket. Empty until trades arrive.

**Solution**: Fetch 1m candles from `/market/sparkline` endpoint. Use lightweight-charts `createChart` with:
- No axes (hidden)
- No crosshair
- Fixed dimensions (96×32px)
- Single `LineSeries` or `AreaSeries`
- Green/red color based on direction

On mount, fetch sparkline data. On WebSocket TRADE events, update the last candle.

### 5.2 `Chart` component — Server-side candles

**Problem**: `buildCandlesFromTrades()` runs client-side for every new trade. `tradeCandles` in useEffect deps causes `fetchKlines()` on every trade.

**Solution**: Remove `buildCandlesFromTrades`. The server provides properly bucketed candles. Chart only needs:
- Initial fetch from `/market/klines` (when market/interval changes)
- Real-time last-candle update from WebSocket TRADE events

### 5.3 Landing page sparkline

Each `LandingMarketRow` gets a mini sparkline component. Data fetched from `POST /market/sparklines` in a single batched request for all 8 preview markets.

---

## 6. Migration Order

| Step | Description | Files affected |
|------|-------------|----------------|
| 1 | Switch Docker image to TimescaleDB (port 5433, dump/restore or re-seed) | docker-compose / run command, all `.env` files |
| 2 | Fix `Kline` PK + add `Candle` model to `schema.prisma` | `libs/db/prisma/schema.prisma` |
| 3 | `prisma migrate dev --create-only`, append hypertable/cagg SQL, `prisma migrate dev` | migration file |
| 4 | Update `eventHandler.ts` to upsert into `Candle` (with `closeTime` fix) | `services/data-service/src/eventHandler.ts` |
| 5 | Update `klineService.ts` for continuous aggregates | `libs/db/src/klineService.ts` |
| 6 | Add `GET /market/sparkline` + `POST /market/sparklines` endpoints | `apps/api-gateway/src/routes/market.ts` |
| 7 | Rewrite `Sparkline` component for TimescaleDB data | `apps/web-client/src/components/Sparkline.tsx` |
| 8 | Remove `buildCandlesFromTrades` from `Chart` | `apps/web-client/src/components/Chart.tsx` |
| 9 | Verify compression and retention policies active | raw SQL check |
| 10 | Backfill historical candle data from `Trade` table | one-time script |
