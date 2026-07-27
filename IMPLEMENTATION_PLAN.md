# Vaultly ↔ Arbitium Integration Plan

Wallet-connect (popup OAuth-style) + deposit/withdraw money rail between **Vaultly** (wallet app, Next.js) and **Arbitium** (exchange, this monorepo).

> Previous phases (Docker/DB, ticker symbols, seed, market-maker, landing/trade page optimization, TimescaleDB) are complete and live in git history. This document supersedes them.

**How to use this document:**
- **PART A (Arbitium)** is implemented in this repo.
- **PART B (Vaultly)** is self-contained — hand it to the Vaultly workspace agent verbatim.
- **SECTION 0 (Shared Contract)** is the single source of truth. Neither side may deviate from endpoint paths, parameter names, payload shapes, status codes, or env var names. If a change is needed, both sides change together.

---

## SECTION 0 — Shared Contract (both sides, no deviation)

### 0.1 Topology (local dev)

| Component | URL |
|---|---|
| Vaultly app | `http://localhost:3001` |
| Arbitium web-client | `http://localhost:5173` |
| Arbitium api-gateway | `http://localhost:3002` |
| Arbitium ws-gateway | `ws://localhost:8080` |

### 0.2 Environment variables

| Var | Lives in | Value / notes |
|---|---|---|
| `JWT_SECRET` | Vaultly **and** Arbitium api-gateway, ws-gateway | **Same value on both sides.** Signs + verifies `arbitium_token` (HS256). |
| `BRIDGE_SECRET` | Vaultly **and** Arbitium api-gateway | **Same value.** Server-to-server only. Never in any `NEXT_PUBLIC_*` / `VITE_*` var. |
| `NEXT_PUBLIC_ARBITIUM_URL` | Vaultly | `http://localhost:5173` — used for redirect allowlist. |
| `ARBITIUM_SYSTEM_USER_ID` | Vaultly | Pooled system account (already seeded). |
| `VAULTLY_URL` | Arbitium api-gateway | `http://localhost:3001` |
| `VITE_VAULTLY_URL` | Arbitium web-client | `http://localhost:3001` |
| `VITE_API_URL` | Arbitium web-client | `http://localhost:3002` (already exists) |
| `VITE_WS_URL` | Arbitium web-client | `ws://localhost:8080` (already exists) |

### 0.3 Token format (`arbitium_token`)

Minted by Vaultly, verified by Arbitium. **Unchanged from current Vaultly behavior:**
- HS256, secret = `JWT_SECRET`, expiry 7 days.
- Payload: `{ userId: string, email: string, phone: string }`.
- Arbitium treats `payload.userId` as `vaultlyUserId`.

### 0.4 Connect flow (popup)

```
1. Arbitium web-client: state = crypto.randomUUID()
   → sessionStorage["vaultly_connect_state"] = state   (BEFORE opening popup)
   → window.open(`${VAULTLY}/connect/arbitium?redirect_uri=${ORIGIN}/auth/callback&state=${state}`)
2. Vaultly /connect/arbitium: validate params → session check
   (no session → /signin?callbackUrl=<back to consent>) → render consent screen
3. User approves → GET /api/arbitium/token?redirectTo=<redirect_uri>&state=<state>
4. Vaultly mints JWT → HTTP 307 → <ARBITIUM>/auth/callback?arbitium_token=<JWT>&state=<state>
5. Arbitium /auth/callback (inside popup): validates state →
   window.opener.postMessage({type:"arbitium:connected", token, state}, <ARBITIUM ORIGIN>) → window.close()
6. Arbitium main window: validates event.origin === own origin + state match
   → stores token (localStorage["arbitium_token"]) → dispatches window event "arbitium:auth"
```

Deny path: consent screen links to `<redirect_uri>?error=access_denied&state=<state>`; callback page postMessages `{type:"arbitium:connect_error", error:"access_denied", state}` and shows a closable message.

**Parameter name asymmetry (intentional, do not "fix"):** the consent page takes `redirect_uri` (OAuth-style); the token route keeps its existing `redirectTo` param name.

**postMessage contract:**
- Success: `{ type: "arbitium:connected", token: string, state: string }`
- Failure: `{ type: "arbitium:connect_error", error: string, state: string }`
- Always sent with explicit targetOrigin = Arbitium origin. Receiver always validates `event.origin === window.location.origin` (the popup navigates back to Arbitium origin before messaging, so the message is same-origin).

**Popup-blocked fallback:** full-page navigation to the same `/connect/arbitium?...` URL. Callback page detects missing `window.opener` → stores token directly → navigates to `/`. Both paths must work.

**sessionStorage note:** popup inherits a copy of the opener's sessionStorage at `window.open` time (per-origin) — this is why `state` is written before opening. Main window re-validates `state` from the postMessage regardless; this is the authoritative check.

### 0.5 Bridge API (money rail)

`POST http://localhost:3001/api/arbitium/bridge`

Headers: `Content-Type: application/json`, `x-bridge-secret: <BRIDGE_SECRET>`

Body:
```json
{ "vaultlyUserId": "string", "amountInPaise": 12345, "direction": "DEPOSIT" | "WITHDRAW", "idempotencyKey": "string (1–128 chars)" }
```

Direction semantics (from Vaultly's perspective):
- `DEPOSIT` = user → Arbitium. Vaultly user balance decreases, system account increases.
- `WITHDRAW` = Arbitium → user. System account decreases, Vaultly user balance increases.

Responses:

| Status | Body | Meaning |
|---|---|---|
| 200 | `{ success: true, ref: string, replayed?: true }` | Done. `ref` = `ArbitiumBridgeTransaction.id`. `replayed: true` if this key already executed. |
| 400 | `{ error }` | Zod validation failed |
| 401 | `{ error }` | Bad `x-bridge-secret` |
| 409 | `{ error: "IDEMPOTENCY_MISMATCH" }` | Same key, different userId/amount/direction |
| 422 | `{ error: "INSUFFICIENT_BALANCE" \| "INSUFFICIENT_SYSTEM_BALANCE" }` | Definitive business failure — safe to surface to user |
| 500 | `{ error }` | Generic failure |

Arbitium-side classification: 200/400/401/409/422 = **definitive**. Network error, timeout (10s), or 5xx = **ambiguous** (Vaultly may have committed) → never finalize locally; resolve via reconcile sweep retrying with the **same** idempotencyKey.

### 0.6 Idempotency invariants (both sides)

1. Every transfer has exactly one `idempotencyKey` (UUID), generated by the Arbitium web-client per user intent, reused on every retry at every layer.
2. Arbitium: `BalanceTransfer.idempotencyKey` is unique. Vaultly: `ArbitiumBridgeTransaction.idempotencyKey` unique + ledger `externalRef = "p2p:<key>"` unique.
3. Replay with matching payload → return original result, no side effects. Replay with mismatched payload → 409, no side effects.
4. Replay short-circuit happens **before** any balance mutation on both sides.
5. Ambiguous outcomes are never marked failed — they stay `PENDING`/`ROLLBACK_PENDING` until the reconcile sweep resolves them.

---

## PART A — ARBITIUM (this repo)

### Phase A1: Public market data (ws-gateway)

**Problem:** ws-gateway closes every connection without a token (`4001`), so logged-out users see no orderbook/chart/trades. Real exchanges stream public market data to everyone; auth is only needed for user-scoped actions.

**Files:** `apps/ws-gateway/src/index.ts`, `apps/ws-gateway/src/session/ClientSession.ts`, `apps/ws-gateway/src/session/messageHandler.ts`

1. `index.ts` connection handler:
   - `const token = url.searchParams.get("token")`
   - Token **absent** → create session with `userId: null` (anonymous).
   - Token **present but invalid/expired** → keep current behavior: `socket.close(4001, "Unauthorized")` (lets the client react to a bad token).
2. `ClientSession`: constructor `userId: string | null`. `onEvent` already filters `COMMAND_REJECTED` by `ownedCommandIds`, and anonymous sessions can never own command IDs — no event leakage.
3. `messageHandler.ts`: `register_command` → if `session.userId === null` → `session.sendError("UNAUTHORIZED")`, return. `subscribe`/`unsubscribe` unchanged (anonymous allowed; `MAX_SUBSCRIPTIONS_PER_CLIENT` still applies).
4. `apps/web-client/src/ws/useMarketFeed.ts`: on close code `4001` → `clearToken()` (token expired/invalid), dispatch `arbitium:auth`, and reconnect anonymously instead of giving up. Token is already appended only when present — no other change.

### Phase A2: Popup wallet connect (web-client)

**Problem:** connect flow is a full-page redirect with no consent screen — bad UX, feels broken. Replace with popup + postMessage per Section 0.4.

**`apps/web-client/src/lib/auth.ts`** (extend, keep existing exports):
- `connectVaultly()`: generate `state = crypto.randomUUID()` → `sessionStorage.setItem("vaultly_connect_state", state)` → build `url = ${VITE_VAULTLY_URL}/connect/arbitium?redirect_uri=${location.origin}/auth/callback&state=${state}` → `window.open(url, "vaultly-connect", "width=480,height=640")`. If popup blocked (`null`) → `location.href = url` (full-page fallback, same URL).
- `initConnectListener()`: register once in `main.tsx`. On `message`: require `event.origin === location.origin` and `event.data.state === sessionStorage.getItem("vaultly_connect_state")`; on `arbitium:connected` → `storeToken(token)`, remove state key; on `arbitium:connect_error` → remove state key (UI shows a "connection cancelled" toast via `arbitium:auth` listeners).
- `storeToken` / `clearToken`: after mutation, `window.dispatchEvent(new Event("arbitium:auth"))`.
- `captureTokenFromUrl()` stays (used by callback page fallback path) — add state validation before storing.

**`apps/web-client/src/pages/AuthCallbackPage.tsx`** (new) + route `/auth/callback` in `App.tsx`:
- Parse `arbitium_token`, `state`, `error` from query.
- If `window.opener` exists → postMessage success or error per contract (targetOrigin = `location.origin`) → `window.close()`. If close fails (some browsers), render "Connected — you can close this window".
- If no `window.opener` (full-page fallback) → validate `state` against sessionStorage → `storeToken` → `navigate("/", { replace: true })`. Mismatched state → render error, do not store.

**Callers:** `WalletButton.tsx` `onConnect` → `connectVaultly()`; `LandingPage.tsx` connect button → `connectVaultly()`.

**Auth-change reactions:** `WalletButton` listens for `arbitium:auth` → reload balance or flip to disconnected. `useMarketFeed` listens → reconnect (picks up/clears token).

**Order placement gate:** `TradePage` owns `connectModalOpen` state, renders `ConnectWalletModal` (`onConnect → connectVaultly()`), passes `onRequireAuth={() => setConnectModalOpen(true)}` to `OrderForm`. In `OrderForm` submit (`placeLimitOrder`/`placeMarketOrder` call sites, ~lines 97/104): if `!isLoggedIn()` → call `onRequireAuth()` and return. Trade page itself stays viewable logged-out (public data per A1); `RequireAuth` in `App.tsx` remains a passthrough.

### Phase A3: Deposit / withdraw UI (web-client)

**`apps/web-client/src/components/TransferModal.tsx`** (new):
- Tabs: Deposit / Withdraw.
- Amount input in ₹ (2 decimals) → paise integer string; validate `> 0`; quick chips ₹100 / ₹500 / ₹1000 / Max (Max = available trading balance, withdraw tab only).
- Shows current available trading balance (from `GET /transfers/balance`, already fetched by WalletButton — pass as prop).
- `idempotencyKey = crypto.randomUUID()` created **once per modal open**; submit disabled while pending; on failure, Retry reuses the **same** key.
- States: idle → pending → success (toast + `arbitium:auth` refresh + close) / error (inline message: 422 → "Insufficient balance", 409 → "Duplicate request mismatch — retry with a new amount", else generic).
- Footer: last 5 transfers from `GET /transfers/history` (direction, amount ₹, status, time).

**`apps/web-client/src/lib/apiClient.ts`** (add, following existing authed-fetch pattern):
- `depositFunds({ amountInPaise: string, idempotencyKey: string })` → `POST /transfers/deposit`
- `withdrawFunds({ amountInPaise: string, idempotencyKey: string })` → `POST /transfers/withdraw`
- `fetchTransferHistory()` → `GET /transfers/history`
- Response types: `{ transferId: string, status: "PENDING"|"COMPLETED"|"FAILED"|"ROLLBACK_PENDING" }`; history rows `{ id, direction, amountInPaise: string, status, createdAt }`.
- Treat HTTP 202 same as 200 (pending is not an error — show "processing" state).

**`WalletButton.tsx`:** dropdown gains "Deposit" and "Withdraw" items → open `TransferModal` on the corresponding tab.

### Phase A4: Money-rail hardening (api-gateway)

**`apps/api-gateway/src/vautlyClient.ts` → rename `vaultlyClient.ts`:**
- Add `signal: AbortSignal.timeout(10_000)` to the fetch.
- Return type becomes:
  ```ts
  type BridgeCallResult =
    | { success: true; ref: string | null; replayed: boolean }
    | { success: false; ambiguous: boolean; error: string }
  ```
  - 200 → parse `{ ref, replayed }`. 400/401/409/422 → `ambiguous: false`. Network error / abort / 5xx → `ambiguous: true`.

**`apps/api-gateway/src/routes/transfers.ts`:**
1. **Replay mismatch check** (both `/deposit` and `/withdraw`): when `BalanceTransfer` exists for `idempotencyKey`, verify `userId`, `amountInPaise`, `direction` match the request → mismatch → `409 { error: "IDEMPOTENCY_MISMATCH" }`.
2. **Ambiguous handling:** `bridgeResult.ambiguous === true` →
   - Deposit: leave status `PENDING`, respond `202 { transferId, status: "PENDING" }`.
   - Withdraw: leave status `ROLLBACK_PENDING`, respond `202 { transferId, status: "ROLLBACK_PENDING" }`.
   - Never mark `FAILED` on ambiguity.
3. **Store `vaultlyRef`** on success (both routes).
4. **Reconcile sweep** — generalize `recoverRollbackPendingWithdrawals()` → `reconcilePendingTransfers()`:
   - Runs at boot (existing call site) + every 60s interval.
   - Sweeps `PENDING` deposits and `ROLLBACK_PENDING` withdraws; increments `attempts` each try; skips records with `attempts >= 10` (log error for manual review).
   - Re-calls bridge with the **same** idempotencyKey (safe per Section 0.5/0.6).
   - Success → complete: deposit = credit + `COMPLETED` in one `$transaction`; withdraw = mark `COMPLETED`. Store `vaultlyRef`.
   - Definitive failure → deposit: mark `FAILED`; withdraw: rollback-credit + `FAILED` in one `$transaction`.
5. **`GET /transfers/history`** (requireAuth + resolveArbitiumUser): latest 20 `BalanceTransfer` for the user, BigInt serialized as string.
6. **Rate limit:** in-memory `Map<userId, timestamps[]>`, 10 requests/min/user on `/transfers/deposit` + `/transfers/withdraw` → 429.

**`libs/db/prisma/schema.prisma` — `BalanceTransfer` additions:**
```prisma
attempts      Int       @default(0)
lastAttemptAt DateTime?
```
Migration: `npx prisma migrate dev --name transfer_attempts` (additive, no data backfill needed). Remember `DATABASE_URL` env must point at port 5433 when running prisma CLI.

### Phase A5: Hygiene

- `apps/web-client/.env.example`: `VITE_VAULTLY_URL`, `VITE_API_URL`, `VITE_WS_URL`.
- `apps/api-gateway/.env` already has `JWT_SECRET`, `BRIDGE_SECRET`, `VAULTLY_URL` — confirm `JWT_SECRET` matches Vaultly's value.
- `pnpm -r exec tsc --noEmit` clean across all packages.

---

## PART B — VAULTLY (hand to Vaultly workspace agent)

> **Context for the Vaultly agent:** Arbitium is a separate exchange app (React web-client `http://localhost:5173`, api-gateway `http://localhost:3002`) that uses Vaultly as its wallet/identity provider. The integration already has: `GET /api/arbitium/token` (session → JWT → 307 redirect) and `POST /api/arbitium/bridge` (server-to-server money movement against a pooled system account, with ledger + `ArbitiumBridgeTransaction`). Two things are being added: (1) a **money-critical idempotency bug fix** in the bridge, and (2) a **popup wallet-connect flow** with a consent screen, replacing the bare redirect. Arbitium's side is being built in parallel against the Shared Contract below — do not deviate from it.

### Shared Contract (identical to Section 0 above — implement exactly)

- `arbitium_token`: HS256 JWT, secret `JWT_SECRET`, 7d expiry, payload `{userId, email, phone}`. **Unchanged.**
- Connect URLs:
  - Consent page: `GET /connect/arbitium?redirect_uri=<url>&state=<nonce>`
  - Token route (existing): `GET /api/arbitium/token?redirectTo=<url>&state=<nonce>` → 307 → `<redirectTo>?arbitium_token=<JWT>&state=<state>`
  - Note the intentional param-name asymmetry: consent page uses `redirect_uri`, token route keeps `redirectTo`.
  - Valid redirect target: origin === origin of `NEXT_PUBLIC_ARBITIUM_URL` (default `http://localhost:5173`) **and** pathname === `/auth/callback`.
- Deny redirect: `<redirect_uri>?error=access_denied&state=<state>`.
- Bridge: `POST /api/arbitium/bridge`, header `x-bridge-secret`, body `{vaultlyUserId, amountInPaise, direction: "DEPOSIT"|"WITHDRAW", idempotencyKey}`.
  - Responses: 200 `{success:true, ref, replayed?}` / 400 validation / 401 bad secret / 409 `IDEMPOTENCY_MISMATCH` / 422 `INSUFFICIENT_BALANCE`|`INSUFFICIENT_SYSTEM_BALANCE` / 500 generic.
  - Arbitium retries ambiguous outcomes (timeout/5xx/network) with the **same** idempotencyKey — replays must be side-effect-free.
- Idempotency rule: replay short-circuit (findUnique + payload match check) happens **before** any balance mutation; mismatch → 409.

### Phase V1: Fix bridge idempotency bug + hardening (MONEY-CRITICAL)

**File:** `apps/user-app/app/api/arbitium/bridge/route.ts`

**Bug:** today the balance mutation executes before the replay short-circuit. A retry with the same `idempotencyKey` double-moves funds while the ledger/bridge records no-op → balance/ledger divergence.

**Fix — restructure the `$transaction` in this exact order:**
1. **First statement inside the tx:** `tx.arbitiumBridgeTransaction.findUnique({ where: { idempotencyKey } })`.
   - Exists + `userId`/`amountInPaise`/`direction` all match → short-circuit: return `200 { success: true, replayed: true, ref: existing.id }` (no mutations).
   - Exists + any mismatch → `409 { error: "IDEMPOTENCY_MISMATCH" }` (no mutations).
2. Existing steps unchanged: upsert both `Balance` rows → `SELECT ... FOR UPDATE` in ascending-id order → balance checks (422s) → apply debit/credit → `postP2PLedger` (keep `externalRef = p2p:<idempotencyKey>` and `assertExistingTxnMatches`; a ledger mismatch must also surface as 409, not silent success).
3. **Replace** the final `arbitiumBridgeTransaction.upsert({ where: { idempotencyKey }, update: {} })` with **`create`**. A concurrent duplicate key raises P2002 → the **entire transaction rolls back** (balances untouched) → catch outside the tx → re-read the existing record → verify payload match → return replayed success (or 409 on mismatch).

**Also:**
- `x-bridge-secret` compare → timing-safe: equal-length `Buffer`s + `crypto.timingSafeEqual` (length mismatch → 401).
- Success response becomes `{ success: true, ref: <bridgeRecord.id> }` (add `replayed: true` on replays). Arbitium stores `ref`.
- Add `Cache-Control: no-store` to this route and `/api/arbitium/token`.
- `ARBITIUM_SYSTEM_USER_ID` pooled account + seed: unchanged.

**V1 tests:**
- Same key + same payload twice → one balance movement, second response `{replayed: true}`.
- Same key + different amount → 409, zero balance movement.
- Two concurrent requests, same key → exactly one succeeds; balances moved once.
- DEPOSIT beyond user balance → 422 `INSUFFICIENT_BALANCE`; WITHDRAW beyond system float → 422 `INSUFFICIENT_SYSTEM_BALANCE`.

### Phase V2: Consent page + token route updates

**New file:** `apps/user-app/app/connect/arbitium/page.tsx` (server component + small client consent card)

1. Read `searchParams`: `redirect_uri`, `state` — both **required**.
2. Validate `redirect_uri`: parseable URL; `origin === new URL(process.env.NEXT_PUBLIC_ARBITIUM_URL ?? "http://localhost:5173").origin`; `pathname === "/auth/callback"`. Invalid → render a plain 400 error page. **Never redirect to an unvalidated URI.**
3. Validate `state`: string, 16–128 chars, `/^[A-Za-z0-9-]+$/`. Invalid → 400 page.
4. `const session = await getServerSession(authOptions)`; if none → `redirect(`/signin?callbackUrl=${encodeURIComponent(`/connect/arbitium?redirect_uri=${encodeURIComponent(redirect_uri)}&state=${encodeURIComponent(state)}`)}`)`.
5. Render consent card (Vaultly design system):
   - Title: "Connect to Arbitium Exchange"
   - Permissions list: "View account identity (email, phone)", "Deposit and withdraw funds"
   - Approve → plain `<a href={`/api/arbitium/token?redirectTo=${encodeURIComponent(redirect_uri)}&state=${encodeURIComponent(state)}`}>` (GET, existing route does the rest).
   - Deny → `<a href={`${redirect_uri}?error=access_denied&state=${encodeURIComponent(state)}`}>`.

**Update:** `apps/user-app/app/api/arbitium/token/route.ts`
- Accept optional `state` param; if present validate 16–128 chars and append `&state=${encodeURIComponent(state)}` to the final redirect URL.
- Tighten `redirectTo` validation: keep exact-origin check, **add** `pathname === "/auth/callback"` requirement.
- Keep everything else unchanged (session check → signin chaining, JWT payload/expiry, 307).

### Phase V3: Connected Apps entry point

- Dashboard: "Connected Apps" card listing **Arbitium Exchange** with status Connected.
- Reuse the existing bridge-transaction display pipeline (`GET /api/user/transactions` → `response.arbitium`, already merged into recent activity + transactions page) — link the card to the transactions view filtered to Arbitium.
- "Manage" action re-opens `/connect/arbitium?redirect_uri=${NEXT_PUBLIC_ARBITIUM_URL}/auth/callback&state=<fresh UUID>` (generating state client-side is fine here — it only needs to be a nonce Arbitium echoes).

### Vaultly verification

1. Bridge replay/mismatch/concurrency tests from V1 all pass.
2. Popup flow: Arbitium opens `/connect/arbitium` → not logged in → signin → back to consent → approve → popup lands on Arbitium `/auth/callback` with token + state → closes. Deny → lands with `error=access_denied`.
3. Full-page (popup-blocked) flow works through the same URLs.
4. Deposit from Arbitium → Vaultly activity shows "Deposited to Arbitium Exchange"; withdraw → "Withdrawn from Arbitium Exchange". Retried bridge call with same key does not create a second activity row.

---

## Parallelization & Sync Points

| Workstream | Depends on | Can start |
|---|---|---|
| V1 (Vaultly bridge fix) | — | Immediately |
| A1 (public market data) | — | Immediately, fully independent |
| A2 (popup connect, Arbitium) | Contract 0.4 only — not V2 | Immediately (integration test needs V2) |
| V2 (consent page) | Contract 0.4 | Immediately |
| A3 (transfer UI) | Contract 0.5 | Immediately |
| A4 (gateway hardening) | V1 response shape (`ref`, `replayed`, 409) | Implement against contract; test after V1 |
| V3 (connected apps UI) | V2 | After V2 |

**Hard sync points (must match exactly):** URLs + param names in 0.4, postMessage types in 0.4, bridge status codes + body keys in 0.5, env var names in 0.2.

## Joint Acceptance Checklist

1. Logged-out user sees live orderbook/chart/trades; placing an order prompts connect.
2. Connect via popup: consent → approve → popup closes, balance appears, WS reconnects — no full-page reload. Deny and popup-blocked paths work.
3. Deposit ₹500: Arbitium balance +₹500, Vaultly shows the activity row. Withdraw reverse.
4. Same idempotencyKey replayed at either side → original result, no double movement. Mismatched replay → 409.
5. Kill Vaultly mid-deposit → transfer stays `PENDING` → Vaultly restarts → reconcile sweep completes it. Same for withdraw (`ROLLBACK_PENDING` → `COMPLETED`).
6. `pnpm -r exec tsc --noEmit` clean (Arbitium); Vaultly typecheck + V1 tests pass.
