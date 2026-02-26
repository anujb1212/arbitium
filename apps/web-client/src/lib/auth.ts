const VAULTLY_URL = import.meta.env.VITE_VAULTLY_URL ?? "http://localhost:3001";
const TOKEN_KEY = "arbitium_token";

export function getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn(): boolean {
    return Boolean(getStoredToken());
}

export function redirectToVaultlyLogin(): void {
    const redirectTo = encodeURIComponent(window.location.origin);
    window.location.href = `${VAULTLY_URL}/api/arbitium/token?redirectTo=${redirectTo}`;
}

export function captureTokenFromUrl(): boolean {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("arbitium_token");

    if (!token) return false;

    storeToken(token);

    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete("arbitium_token");
    window.history.replaceState({}, "", cleanUrl.toString());

    return true;
}
