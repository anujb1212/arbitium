import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type AuthenticatedRequest = Request & {
    vaultlyUserId: string;
    userEmail: string | null;
};

export function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
        res.status(500).json({ error: "JWT_SECRET not configured" });
        return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Missing authorization header" });
        return;
    }

    const token = authHeader.slice(7);

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

        const vaultlyUserId = decoded.userId as string | undefined;
        if (!vaultlyUserId) {
            res.status(401).json({ error: "Invalid token: missing userId" });
            return;
        }

        (req as AuthenticatedRequest).vaultlyUserId = vaultlyUserId;
        (req as AuthenticatedRequest).userEmail = (decoded.email as string) ?? null;

        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid or expired token" });
    }
}
