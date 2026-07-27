const VAULTLY_URL = process.env.VAULTLY_URL ?? "http://localhost:3001";
const BRIDGE_SECRET = process.env.BRIDGE_SECRET;

type BridgeCallArgs = {
    vaultlyUserId: string;
    amountInPaise: number;
    direction: "DEPOSIT" | "WITHDRAW";
    idempotencyKey: string;
};

export type BridgeCallResult =
    | { success: true; ref: string | null; replayed: boolean }
    | { success: false; ambiguous: boolean; error: string };

export async function callVaultlyBridge(args: BridgeCallArgs): Promise<BridgeCallResult> {
    if (!BRIDGE_SECRET) {
        return { success: false, ambiguous: false, error: "BRIDGE_SECRET not configured" };
    }

    try {
        const response = await fetch(`${VAULTLY_URL}/api/arbitium/bridge`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-bridge-secret": BRIDGE_SECRET,
            },
            body: JSON.stringify(args),
            signal: AbortSignal.timeout(10_000),
        });

        if (response.status === 200) {
            const body = await response.json() as { ref?: string; replayed?: boolean };
            return { success: true, ref: body.ref ?? null, replayed: body.replayed ?? false };
        }

        if (response.status === 422) {
            const body = await response.json();
            return { success: false, ambiguous: false, error: body.error ?? "Insufficient balance" };
        }

        if (response.status === 400 || response.status === 401 || response.status === 409) {
            const body = await response.json();
            return { success: false, ambiguous: false, error: body.error ?? `Vaultly bridge: ${response.status}` };
        }

        return { success: false, ambiguous: true, error: `Vaultly bridge error: ${response.status}` };
    } catch {
        return { success: false, ambiguous: true, error: "Vaultly unreachable" };
    }
}
