const VAULTLY_URL = import.meta.env.VITE_VAULTLY_URL ?? "http://localhost:3001";
const TOKEN_KEY = "arbitium_token";
const STATE_KEY = "vaultly_connect_state";

const CONNECT_MESSAGE_TYPES = {
    connected: "arbitium:connected",
    error: "arbitium:connect_error",
} as const;

export function getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    window.dispatchEvent(new Event("arbitium:auth"));
}

export function clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new Event("arbitium:auth"));
}

export function isLoggedIn(): boolean {
    return Boolean(getStoredToken());
}

export function connectVaultly(): void {
    const state = crypto.randomUUID();
    sessionStorage.setItem(STATE_KEY, state);

    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback`);
    const url = `${VAULTLY_URL}/connect/arbitium?redirect_uri=${redirectUri}&state=${encodeURIComponent(state)}`;

    const popup = window.open(url, "vaultly-connect", "width=480,height=640");
    if (!popup) {
        window.location.href = url;
    }
}

export function redirectToVaultlyLogin(): void {
    connectVaultly();
}

let connectListenerRegistered = false;

export function initConnectListener(
    addToast: (type: "success" | "error" | "info", title: string, message?: string) => void
): void {
    if (connectListenerRegistered) return;
    connectListenerRegistered = true;

    window.addEventListener("message", (event) => {
        if (event.origin !== window.location.origin) return;

        const data = event.data as Record<string, unknown> | undefined;
        if (!data || typeof data !== "object") return;

        const storedState = sessionStorage.getItem(STATE_KEY);
        if (!storedState || data.state !== storedState) return;

        sessionStorage.removeItem(STATE_KEY);

        if (data.type === CONNECT_MESSAGE_TYPES.connected && typeof data.token === "string") {
            storeToken(data.token);
            addToast("success", "Connected", "Vaultly wallet connected successfully");
        } else if (data.type === CONNECT_MESSAGE_TYPES.error) {
            addToast("error", "Connection Cancelled", "Connection to Vaultly was cancelled");
        }
    });
}

export function captureTokenFromUrl(): boolean {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("arbitium_token");
    const state = params.get("state");

    if (!token) return false;

    const storedState = sessionStorage.getItem(STATE_KEY);
    if (storedState && state && state !== storedState) {
        sessionStorage.removeItem(STATE_KEY);
        return false;
    }
    sessionStorage.removeItem(STATE_KEY);

    storeToken(token);

    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete("arbitium_token");
    cleanUrl.searchParams.delete("state");
    cleanUrl.searchParams.delete("error");
    window.history.replaceState({}, "", cleanUrl.toString());

    return true;
}
