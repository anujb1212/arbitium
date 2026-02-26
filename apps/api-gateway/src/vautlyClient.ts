const VAULTLY_URL = process.env.VAULTLY_URL ?? "http://localhost:3001";
const BRIDGE_SECRET = process.env.BRIDGE_SECRET;

type BridgeCallArgs = {
    vaultlyUserId: string;
    amountInPaise: number;
    direction: "DEPOSIT" | "WITHDRAW";
    idempotencyKey: string;
};

type BridgeCallResult =
    | { success: true }
    | { success: false; error: string };

export async function callVaultlyBridge(args: BridgeCallArgs): Promise<BridgeCallResult> {
    if (!BRIDGE_SECRET) {
        return { success: false, error: "BRIDGE_SECRET not configured" };
    }

    try {
        const response = await fetch(`${VAULTLY_URL}/api/arbitium/bridge`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-bridge-secret": BRIDGE_SECRET,
            },
            body: JSON.stringify(args),
        });

        if (response.status === 422) {
            const body = await response.json();
            return { success: false, error: body.error ?? "Insufficient balance" };
        }

        if (!response.ok) {
            return { success: false, error: `Vaultly bridge error: ${response.status}` };
        }

        return { success: true };
    } catch {
        return { success: false, error: "Vaultly unreachable" };
    }
}
