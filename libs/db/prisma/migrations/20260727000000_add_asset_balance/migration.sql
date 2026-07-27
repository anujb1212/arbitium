 -- CreateTable
    CREATE TABLE "AssetBalance" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "market" TEXT NOT NULL,
        "asset" TEXT NOT NULL,
        "available" BIGINT NOT NULL DEFAULT 0,
        "locked" BIGINT NOT NULL DEFAULT 0,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "AssetBalance_pkey" PRIMARY KEY ("id")
    );

    -- CreateIndex
    CREATE UNIQUE INDEX "AssetBalance_userId_market_key" ON "AssetBalance"("userId", "market");

    -- CreateIndex
    CREATE INDEX "AssetBalance_userId_idx" ON "AssetBalance"("userId");

    -- CreateIndex
    CREATE INDEX "AssetBalance_market_idx" ON "AssetBalance"("market");

    -- AddForeignKey
    ALTER TABLE "AssetBalance" ADD CONSTRAINT "AssetBalance_userId_fkey" FOREIGN KEY ("userId") REFERENCES
  "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;