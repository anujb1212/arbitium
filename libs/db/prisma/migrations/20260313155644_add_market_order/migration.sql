-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('LIMIT', 'MARKET');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "consumedLocked" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "orderType" "OrderType" NOT NULL DEFAULT 'LIMIT';
