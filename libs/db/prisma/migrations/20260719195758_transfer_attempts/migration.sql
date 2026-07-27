-- DropIndex
DROP INDEX "Candle_openTime_idx";

-- DropIndex
DROP INDEX "Kline_openTime_idx";

-- AlterTable
ALTER TABLE "BalanceTransfer" ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastAttemptAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "BalanceTransfer_status_attempts_idx" ON "BalanceTransfer"("status", "attempts");
