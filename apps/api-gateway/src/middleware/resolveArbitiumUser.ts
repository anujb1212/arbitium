import { Request, Response, NextFunction } from "express";
import { prisma, creditTradingBalance } from "@arbitium/db";
import { AuthenticatedRequest } from "./auth";

const WELCOME_BONUS = 50000n;

export type ArbitriumUserRequest = AuthenticatedRequest & {
    arbitiumUserId: string;
    welcomeBonusGranted: boolean;
};

export async function resolveArbitiumUser(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const authReq = req as AuthenticatedRequest;

    try {
        let user = await prisma.user.findUnique({
            where: { vaultlyUserId: authReq.vaultlyUserId },
            select: {
                id: true,
                welcomeBonusCredited: true
            },
        });

        if (!user) {
            try {
                user = await prisma.user.create({
                    data: {
                        vaultlyUserId: authReq.vaultlyUserId,
                        email: authReq.userEmail ?? undefined,
                    },
                    select: { id: true, welcomeBonusCredited: true },
                });
            } catch (error: unknown) {
                if ((error as { code?: string }).code === "P2002") {
                    user = await prisma.user.findUnique({
                        where: { vaultlyUserId: authReq.vaultlyUserId },
                        select: { id: true, welcomeBonusCredited: true },
                    });
                } else {
                    throw error;
                }
            }
        }

        if (!user) {
            throw new Error(`Failed to resolve user for vaultlyUserId=${authReq.vaultlyUserId}`);
        }

        let welcomeBonusGranted = false;

        if (!user.welcomeBonusCredited) {
            await prisma.$transaction(async (tx) => {
                const locked = await tx.user.findUnique({
                    where: { id: user.id },
                    select: { welcomeBonusCredited: true },
                });

                if (locked?.welcomeBonusCredited) return;

                await creditTradingBalance({
                    prisma: tx as typeof prisma,
                    userId: user.id,
                    amountInPaise: WELCOME_BONUS,
                });

                await tx.user.update({
                    where: { id: user.id },
                    data: { welcomeBonusCredited: true },
                });
            });

            welcomeBonusGranted = true;
        }

        (req as ArbitriumUserRequest).arbitiumUserId = user.id;
        (req as ArbitriumUserRequest).welcomeBonusGranted = welcomeBonusGranted;
        next();
    } catch (error) {
        console.error("[resolveArbitiumUser] error:", error);
        res.status(500).json({ error: "Failed to resolve user" });
    }
}
