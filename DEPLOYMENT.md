# Arbitium - Deployment & Infrastructure Plan

## 1. Infrastructure Overview

Arbitium (Centralized Exchange) is deployed on a shared AWS EC2 instance alongside the Vaultly project. The EC2 instance acts as a stateless compute host, relying on managed services for all persistent state.

### Machine Specifications
- Instance Type: m7i-flex.xlarge (4 vCPU, 16 GiB RAM)
- Region: ap-south-1 (Mumbai)
- Operating System: Ubuntu Server 22.04 LTS

### Managed External Services
- Time-Series Persistence: Tiger Data TimescaleDB (Prod, 1 CPU, PgBouncer enabled, ap-south-1)

### Local Services (Docker Compose)
- Orderbook & Pub/Sub: Two Redis 7 containers run alongside Arbitium containers on the EC2 host. One Redis per project (Arbitium + Vaultly) for namespace/eviction isolation. No TLS needed (localhost communication); AOF persistence with `appendonly yes` protects against EC2 restart data loss. Redis data directory bind-mounted to host for durability.

### Shared Infrastructure Context (Vaultly)
- No Source Code on Server: The server only runs pre-built Docker images. No Git repositories or Node.js environments exist on the host.
- Shared Edge Router: A single Nginx container (`~/edge-router` on EC2) reverse-proxies the entire machine, routing by `server_name`. It terminates TLS (certbot/Let's Encrypt) for both projects.
- Directory Isolation: Arbitium artifacts live in `~/arbitium`, Vaultly in `~/vaultly`.
- Memory Budget: 16 GiB is shared. Every Arbitium container MUST set `mem_limit` in compose (suggested: engine 2g, web 128m, api-gateway 512m, ws-gateway 512m, data-service 512m, market-maker 256m) so neither project can starve the other.
- Disk Hygiene: CI deploys must end with `docker image prune -f` — repeated image pulls fill the disk.

## 2. Container Architecture

6 stateless containers (plus shared Edge Router).

### 1. Web Client
- Source: `apps/web-client`
- Serves compiled Vite/React statics via internal Nginx. Port 80 internal.
- Vite bakes env at build time → image requires build ARGs `VITE_API_URL`, `VITE_WS_URL`.

### 2. API Gateway
- Source: `apps/api-gateway`
- REST API (orders, transfers, market data). Stateless. Port 8080 internal.
- Exposes `/health` for Docker healthcheck.

### 3. WS Gateway
- Source: `apps/ws-gateway`
- Persistent WebSocket connections for orderbook/trade feed. Port 8081 internal.
- Single replica only (per-connection state; scale-out later requires Redis pub/sub fanout).

### 4. Matching Engine
- Source: `apps/engine-ts`
- In-memory orderbook, processes commands via Redis streams. No port.
- Single-replica enforcement: Redis market lock (`apps/engine-ts/src/distributed/marketLock.ts`) with heartbeat + SIGTERM release. On lock conflict the process exits(1); `restart: unless-stopped` retries until the old container releases. Safe under compose recreate.
- State recovery: local snapshot (`snapshotStore.ts`, every `SNAPSHOT_EVERY_N_COMMANDS`=500) + WAL dry-run replay of the command stream from `snapshot.lastCommandStreamId` (`runtime/recovery.ts`).
- REQUIRED volume: named volume `engine-snapshots` mounted to `SNAPSHOT_DIR=/data/snapshots`. Without it every redeploy forces full stream replay.

### 5. Data Service
- Source: `services/data-service`
- Consumes matched trade events, writes to TimescaleDB. Absorbs DB backpressure. No port.
- Uses consumer group + XAUTOCLAIM reclaim (`reclaimPendingMessages`) — survives crashes without loss.

### 6. Market Maker Bot
- Source: `services/market-maker`
- Cron/tick dummy liquidity. No port.
- Must run exactly 1 instance. Known gap: no distributed lock today (engine has one; bot doesn't) — do not scale above 1 replica.

## 3. Implementation Plan

### Phase 1: Dockerization (Local)
- Root `.dockerignore`: block `node_modules`, `.env`, `.git`.
- `docker/Dockerfile.node` (all 5 Node services, pnpm workspace):
  - Multi-stage; build with `pnpm --filter <app>...` so `libs/*` deps are included.
  - Run `prisma generate` in build (client outputs to `libs/db/generated`).
  - Base image: `node:22-slim` (Debian). Avoid alpine — Prisma engine musl `binaryTargets` issues.
  - Runtime layer via `pnpm deploy --prod --filter <app>` (or equivalent prune) for small images.
  - Service selected via build ARG (e.g. `APP=api-gateway`).
- `docker/Dockerfile.web`: multi-stage Vite build → `nginx:alpine`; build ARGs `VITE_API_URL` / `VITE_WS_URL`.
- `apps/web-client/nginx.conf`: SPA fallback (`try_files $uri /index.html`), gzip, long cache headers on `/assets`. This is the only web nginx.conf — ignore the root `nginx.conf`.

### Phase 2: Orchestration & Routing
- `docker-compose.yml` (6 containers) with:
  - `restart: unless-stopped` on all.
  - `mem_limit` per container (see §1 budget).
  - Named volume `engine-snapshots` → engine `SNAPSHOT_DIR=/data/snapshots`.
  - Healthchecks: api-gateway (`GET /health`), ws-gateway; others `process` checks optional.
  - `env_file: .env` for secrets — never baked into images.
- Secrets delivery: `.env` is dockerignored/gitignored → create `~/arbitium/.env` once manually on EC2 (or scp via CI). Compose reads it via `env_file`.
- Compose delivery: CI scp's `docker-compose.yml` to `~/arbitium/` before deploy (no repo on server).
- Redis URL: `redis://arbitium-redis:6379` (local container, no TLS).
- Edge Router (`~/edge-router/nginx.conf`):
  - TLS via certbot; 80 → 443 redirect.
  - `arbitium.<domain>/` → web:80; `/api` → api-gateway:8080; `/ws` → ws-gateway:8080 (path-based, one cert).
  - `/ws` block requires: `proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade"; proxy_read_timeout 3600s;`

### Phase 3: CI/CD Pipeline (GitHub Actions)
- Build: run tests → build 6 images → tag `latest` + commit SHA.
- Push: Docker Hub or AWS ECR.
- Migrate (BEFORE deploy): job runs `npx prisma migrate deploy` against Tiger Data (from a runner or one-off container). Server has no source — migrations never run on host.
  - TimescaleDB hypertables + continuous aggregates ship as raw SQL files inside the Prisma migrations folder so `migrate deploy` applies them.
- Deploy: SSH (GitHub Secrets) → `cd ~/arbitium` → `docker compose pull && docker compose up -d` → `docker image prune -f`.
- Rollback: compose supports pinned SHA tag; redeploy previous tag. Echo deployed SHA in job output.

### Phase 4: Production Readiness
- Prisma URL uses `?sslmode=require&pgbouncer=true`.
- Hypertables/continuous aggregates applied via `migrate deploy` (raw SQL migrations above).
- Verify engine snapshot restore: `docker compose down && up -d` → engine logs `snapshot loaded ... bookSeq=N` (volume persists).
- Verify engine lock: old container releases before new acquires during recreate; no double-processing.
- Verify data-service reclaim: kill -9 mid-batch → XAUTOCLAIM picks up pending on restart.
- Verify `wss://` through edge router (upgrade headers, no 60s idle drop).
- Verify Redis memory usage via `docker stats`; AOF file size on host disk stays bounded.

## 4. Known Constraints & Edge Cases
- Redis persistence: AOF only writes on fsync policy. Power loss on EC2 may lose last few events if `appendfsync` is not `always`. Acceptable for a CEX where orderbook resets on engine restart anyway; snapshots guard state.
- Stream trimming vs recovery: engine recovery replays the command stream from `snapshot.lastCommandStreamId`. NEVER add naive `XADD MAXLEN` / `XTRIM` on engine command/event streams — trimming must be snapshot-aware (only trim below the last snapshotted stream id).
- Engine consumer name is random per boot (`engine-${instanceId}`); recovery does not rely on PEL reclaim — do not "fix" by adding XAUTOCLAIM to engine without replay-order analysis.
- Market-maker has no distributed lock — keep replicas=1.
- Shared host: Vaultly deploys share the edge router and Docker daemon — never `docker system prune` (would nuke Vaultly images); only `docker image prune -f`.
