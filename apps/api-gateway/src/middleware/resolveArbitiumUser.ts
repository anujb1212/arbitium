import { Request, Response, NextFunction } from "express";
import { prisma } from "@arbitium/db";
import { AuthenticatedRequest } from "./auth";

export type ArbitriumUserRequest = AuthenticatedRequest & {
    arbitiumUserId: string;
};

export async function resolveArbitiumUser(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const authReq = req as AuthenticatedRequest;

    try {
        const user = await prisma.user.upsert({
            where: { vaultlyUserId: authReq.vaultlyUserId },
            update: {},
            create: {
                vaultlyUserId: authReq.vaultlyUserId,
                email: authReq.userEmail ?? undefined,
            },
            select: { id: true },
        });

        (req as ArbitriumUserRequest).arbitiumUserId = user.id;
        next();
    } catch {
        res.status(500).json({ error: "Failed to resolve user" });
    }
}
