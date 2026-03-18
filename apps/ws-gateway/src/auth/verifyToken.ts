import jwt from "jsonwebtoken";

export type VerifiedToken = { userId: string };

export function verifyConnectionToken(token: string): VerifiedToken | null {
    const jwtSecret = process.env.JWT_SECRET ?? "";
    if (!jwtSecret) {
        console.error("[ws] JWT_SECRET is not set")
        return null;
    }

    if (!jwtSecret) return null;
    try {
        const payload = jwt.verify(token, jwtSecret);
        if (
            typeof payload === "object" &&
            payload !== null &&
            (
                typeof (payload as Record<string, unknown>)["sub"] === "string" ||
                typeof (payload as Record<string, unknown>)["userId"] === "string"
            )
        ) {
            return {
                userId: (
                    (payload as Record<string, unknown>)["sub"] ??
                    (payload as Record<string, unknown>)["userId"]
                ) as string
            };
        }
        return null;
    } catch {
        return null;
    }
}
