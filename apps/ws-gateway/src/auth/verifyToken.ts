import jwt from "jsonwebtoken";

export type VerifiedToken = { userId: string };

export function verifyConnectionToken(token: string): VerifiedToken | null {
    const jwtSecret = process.env.JWT_SECRET ?? "";
    if (!jwtSecret) return null;
    try {
        const payload = jwt.verify(token, jwtSecret);
        if (
            typeof payload === "object" &&
            payload !== null &&
            typeof (payload as Record<string, unknown>)["sub"] === "string"
        ) {
            return { userId: (payload as Record<string, unknown>)["sub"] as string };
        }
        return null;
    } catch {
        return null;
    }
}
