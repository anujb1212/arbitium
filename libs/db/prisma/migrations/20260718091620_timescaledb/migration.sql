/*
  Warnings:

  - The primary key for the `Kline` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Kline` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Kline` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Kline` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Kline_market_interval_openTime_key";

-- AlterTable
ALTER TABLE "Kline" DROP CONSTRAINT "Kline_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "id",
DROP COLUMN "updatedAt",
ADD CONSTRAINT "Kline_pkey" PRIMARY KEY ("market", "interval", "openTime");

-- CreateTable
CREATE TABLE "Candle" (
    "market" TEXT NOT NULL,
    "resolution" TEXT NOT NULL,
    "openTime" TIMESTAMP(3) NOT NULL,
    "closeTime" TIMESTAMP(3) NOT NULL,
    "open" BIGINT NOT NULL,
    "high" BIGINT NOT NULL,
    "low" BIGINT NOT NULL,
    "close" BIGINT NOT NULL,
    "volume" BIGINT NOT NULL DEFAULT 0,
    "tradeCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Candle_pkey" PRIMARY KEY ("market","resolution","openTime")
);

-- CreateIndex
CREATE INDEX "Candle_market_resolution_openTime_idx" ON "Candle"("market", "resolution", "openTime");

-- TimescaleDB: convert tables to hypertables
SELECT create_hypertable('"Kline"', 'openTime',
  chunk_time_interval => INTERVAL '1 day',
  if_not_exists => TRUE
);

SELECT create_hypertable('"Candle"', 'openTime',
  chunk_time_interval => INTERVAL '1 day',
  if_not_exists => TRUE
);

-- Compression for Kline
ALTER TABLE "Kline" SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'market, interval',
  timescaledb.compress_orderby = '"openTime" DESC'
);
SELECT add_compression_policy('"Kline"', INTERVAL '7 days', if_not_exists => TRUE);

-- Compression + retention for Candle
ALTER TABLE "Candle" SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'market, resolution',
  timescaledb.compress_orderby = '"openTime" DESC'
);
SELECT add_compression_policy('"Candle"', INTERVAL '7 days', if_not_exists => TRUE);
SELECT add_retention_policy('"Candle"', INTERVAL '90 days', if_not_exists => TRUE);

-- Continuous aggregate: hourly candles from 1m Candle data
CREATE MATERIALIZED VIEW IF NOT EXISTS "CandleHourly"
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
  schedule_interval => INTERVAL '1 hour',
  if_not_exists => TRUE
);

-- Continuous aggregate: daily candles from 1m Candle data
CREATE MATERIALIZED VIEW IF NOT EXISTS "CandleDaily"
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
  schedule_interval => INTERVAL '1 day',
  if_not_exists => TRUE
);
