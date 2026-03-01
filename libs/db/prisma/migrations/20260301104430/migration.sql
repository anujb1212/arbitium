/*
  Warnings:

  - A unique constraint covering the columns `[makerOrderId,takerOrderId]` on the table `Trade` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Trade_makerOrderId_takerOrderId_key" ON "Trade"("makerOrderId", "takerOrderId");
