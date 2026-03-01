-- CreateEnum
CREATE TYPE "KlineInterval" AS ENUM ('ONE_MINUTE', 'FIVE_MINUTES', 'FIFTEEN_MINUTES', 'ONE_HOUR', 'ONE_DAY');

-- CreateTable
CREATE TABLE "Kline" (
    "id" TEXT NOT NULL,
    "market" TEXT NOT NULL,
    "interval" "KlineInterval" NOT NULL,
    "openTime" TIMESTAMP(3) NOT NULL,
    "closeTime" TIMESTAMP(3) NOT NULL,
    "open" BIGINT NOT NULL,
    "high" BIGINT NOT NULL,
    "low" BIGINT NOT NULL,
    "close" BIGINT NOT NULL,
    "volume" BIGINT NOT NULL,
    "tradeCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kline_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Kline_market_interval_openTime_idx" ON "Kline"("market", "interval", "openTime");

-- CreateIndex
CREATE UNIQUE INDEX "Kline_market_interval_openTime_key" ON "Kline"("market", "interval", "openTime");
