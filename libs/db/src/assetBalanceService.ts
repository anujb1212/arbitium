import { Prisma, PrismaClient } from "../generated/prisma";

export async function ensureAssetBalance(
  client: PrismaClient | Prisma.TransactionClient,
  userId: string,
  market: string,
  asset: string,
): Promise<void> {
  await client.assetBalance.upsert({
    where: { userId_market: { userId, market } },
    update: {},
    create: { userId, market, asset, available: 0n, locked: 0n },
  });
}

export async function lockAssetForSell(
  tx: Prisma.TransactionClient,
  userId: string,
  market: string,
  asset: string,
  qty: bigint,
): Promise<void> {
  await ensureAssetBalance(tx, userId, market, asset);

  const balance = await tx.assetBalance.findUniqueOrThrow({
    where: { userId_market: { userId, market } },
  });

  const openSellOrders = await tx.order.findMany({
    where: {
      userId,
      market,
      side: "SELL",
      status: { in: ["PENDING", "OPEN", "PARTIALLY_FILLED"] },
    },
    select: { qty: true, filledQty: true },
  });

  const alreadyLocked = openSellOrders.reduce(
    (sum, o) => sum + (o.qty - o.filledQty),
    0n,
  );

  const availableForSell = balance.available > alreadyLocked ? balance.available - alreadyLocked : 0n;

  if (qty > availableForSell) {
    throw new Error(
      `Insufficient holdings: available=${availableForSell} required=${qty}`,
    );
  }

  await tx.assetBalance.update({
    where: { userId_market: { userId, market } },
    data: {
      available: { decrement: qty },
      locked: { increment: qty },
    },
  });
}

export async function releaseAssetLock(
  tx: Prisma.TransactionClient,
  userId: string,
  market: string,
  qty: bigint,
): Promise<void> {
  await tx.assetBalance.update({
    where: { userId_market: { userId, market } },
    data: {
      available: { increment: qty },
      locked: { decrement: qty },
    },
  });
}

export async function creditAssetOnBuy(
  tx: Prisma.TransactionClient,
  userId: string,
  market: string,
  asset: string,
  qty: bigint,
): Promise<void> {
  await ensureAssetBalance(tx, userId, market, asset);
  await tx.assetBalance.update({
    where: { userId_market: { userId, market } },
    data: { available: { increment: qty } },
  });
}

export async function consumeAssetLockOnSell(
  tx: Prisma.TransactionClient,
  userId: string,
  market: string,
  qty: bigint,
): Promise<void> {
  await tx.assetBalance.update({
    where: { userId_market: { userId, market } },
    data: { locked: { decrement: qty } },
  });
}

export async function queryAssetBalancesByUser(
  client: PrismaClient | Prisma.TransactionClient,
  userId: string,
) {
  return client.assetBalance.findMany({
    where: { userId },
    orderBy: { market: "asc" },
  });
}
