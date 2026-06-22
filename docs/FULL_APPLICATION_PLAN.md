# Goaname — Full Application Build Plan

Detailed plan to evolve the current scaffold into a **production-ready, white-label prediction market platform** (5050-style UX, Orleans backend, multi-tenant).

**Baseline (already built):** Tenant API, User/UserAuth grains, register/login, wallet, payout account (generic), LMSR math, domain models, CSS theme tokens, mock frontend, Orleans 10 + Postgres + Redis.

**Target:** End-to-end betting — browse markets → deposit → bet with live odds → resolve → settle → withdraw — across multiple tenants with admin tooling and production ops.

---

## Table of Contents

1. [Architecture Target](#1-architecture-target)
2. [Definition of Done](#2-definition-of-done)
3. [Phase 1 — Market Engine](#phase-1--market-engine)
4. [Phase 2 — Betting & Transactions](#phase-2--betting--transactions)
5. [Phase 3 — Real-Time UX](#phase-3--real-time-ux)
6. [Phase 4 — Money In / Out](#phase-4--money-in--out)
7. [Phase 5 — Settlement & Lifecycle](#phase-5--settlement--lifecycle)
8. [Phase 6 — Admin & White-Label](#phase-6--admin--white-label)
9. [Phase 7 — Risk & Compliance](#phase-7--risk--compliance)
10. [Phase 8 — Production Platform](#phase-8--production-platform)
11. [Cross-Cutting Standards](#cross-cutting-standards)
12. [Dependency Graph](#dependency-graph)
13. [Rough Timeline](#rough-timeline)

---

## 1. Architecture Target

```text
┌─────────────────────────────────────────────────────────────────┐
│  React SPA (tenant-branded)                                      │
│  Auth · Markets · Bet slip · Wallet · Admin dashboard           │
└───────────────────────────┬─────────────────────────────────────┘
                            │ REST + SignalR (JWT)
┌───────────────────────────▼─────────────────────────────────────┐
│  Goaname.Presentation (ASP.NET Minimal APIs)                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │ MediatR
┌───────────────────────────▼─────────────────────────────────────┐
│  Goaname.Application (commands/queries, transaction runners)     │
└───────────────────────────┬─────────────────────────────────────┘
                            │ IGrainFactory
┌───────────────────────────▼─────────────────────────────────────┐
│  Orleans Silo (Grains)                                           │
│  Tenant · User · UserAuth · Market · BetSlip · Settlement · Fraud│
└───────────┬─────────────────────────────┬───────────────────────┘
            │ AdoNet persistence          │ Redis clustering
┌───────────▼──────────┐       ┌──────────▼──────────┐
│  PostgreSQL           │       │  Redis               │
│  Grain state + EF     │       │  Cluster + cache     │
│  read projections     │       │  theme cache         │
└───────────────────────┘       └─────────────────────┘
```

**Grain key convention:** `{tenantId}_{entity}_{id}` (already in `GrainKeys`).

---

## 2. Definition of Done

The application is **full-fledged** when all of the following work in a staging environment:

| # | Capability | Acceptance criteria |
|---|------------|---------------------|
| 1 | Multi-tenant | Two tenants isolated; users/markets never cross tenants |
| 2 | Auth | Register, login, JWT; production IdP optional |
| 3 | Markets | CRUD lifecycle Draft→Open→Closing→Resolved→Settled |
| 4 | AMM | LMSR odds update on every bet; displayed Yes/No multipliers |
| 5 | Betting | ACID place-bet; insufficient balance rolls back entire tx |
| 6 | Real-time | Odds/volume/traders update on all connected clients < 1s |
| 7 | Wallet | Deposit, withdraw (verified payout), balance, history |
| 8 | Settlement | Resolve market; winners paid; losers marked; market Settled |
| 9 | Admin | Create/resolve markets; theme + fees; fraud review |
| 10 | Ops | Docker/K8s deploy, migrations, health checks, structured logs |

---

## Phase 1 — Market Engine

**Goal:** Real markets in the API and UI (no betting yet).

**Duration estimate:** 1–2 weeks

### 1.1 Domain & grains

| Task | Details |
|------|---------|
| `IMarketGrain` | Interface in `Goaname.Grains.Interfaces` |
| `MarketGrain` | Persistent state `MarketState`; single-threaded |
| Create market | `CreateAsync(title, category, tradingEndsAt, liquidityParameter?)` → Draft |
| Publish | `PublishAsync()` → Open, `IsVisible = true` |
| Close trading | `CloseTradingAsync()` → Closing |
| Get state / odds | `GetStateAsync()`, `GetCurrentOddsAsync()` using `LmsrCalculator` |
| List helper | No grain list — use EF projection (below) |

**Methods sketch:**

```csharp
Task<MarketState> GetStateAsync();
Task CreateAsync(CreateMarketCommand cmd);
Task PublishAsync();
Task CloseTradingAsync();
Task<OddsSnapshot> GetOddsAsync();
```

### 1.2 Application layer

| Feature folder | Command / Query |
|----------------|-----------------|
| `Features/Markets/CreateMarket` | Admin creates draft |
| `Features/Markets/PublishMarket` | Draft → Open |
| `Features/Markets/CloseMarket` | Open → Closing |
| `Features/Markets/GetMarket` | Single market + odds |
| `Features/Markets/ListMarkets` | Filter: status, category, search text |

Validators: title length, category in tenant allow-list, `tradingEndsAt` in future.

### 1.3 Read model (EF)

| Task | Details |
|------|---------|
| Register `GoanameDbContext` in DI | `Infrastructure/DependencyInjection.cs` |
| Migration | `MarketProjection` table |
| Sync worker | `IHostedService` or grain reminder: on market write, upsert projection |
| Indexes | `(TenantId, Status)`, `(TenantId, Category)`, full-text on `Title` optional |

### 1.4 API endpoints

```http
GET    /api/tenants/{tenantId}/markets?category=&status=&q=
GET    /api/tenants/{tenantId}/markets/{marketId}
GET    /api/tenants/{tenantId}/markets/{marketId}/odds
POST   /api/tenants/{tenantId}/admin/markets              # Admin
POST   /api/tenants/{tenantId}/admin/markets/{id}/publish
POST   /api/tenants/{tenantId}/admin/markets/{id}/close
```

### 1.5 Frontend

| Component | Work |
|-----------|------|
| `MarketsPage` | Fetch list API; replace `mockMarkets.ts` |
| `MarketCard` | Props from API: title, yes/no %, odds, volume, traders, days left |
| `CategoryFilter` | Wire to query param |
| `SearchBar` | Debounced `q` param |
| `AdminMarkets` | Simple form: create + publish (admin role) |

### 1.6 Tests

- Unit: `LmsrCalculator` edge cases (zero volume, large bet)
- Integration: create market grain → read odds
- API: list filters return correct subset

**Phase 1 exit:** User sees live market cards from API; admin can create/publish markets.

---

## Phase 2 — Betting & Transactions

**Goal:** Users can place bets; wallet debited; market AMM updated atomically.

**Duration estimate:** 2–3 weeks

### 2.1 BetSlip grain

| Task | Details |
|------|---------|
| `IBetSlipGrain` | Key: `{tenantId}_betslip_{betSlipId}` |
| `BetSlipGrain` | Immutable after create; state from `BetSlipState` |
| `CreateAsync` | userId, marketId, outcome, amount, oddsAtPlacement, sharesReceived |

### 2.2 Market grain — betting

| Task | Details |
|------|---------|
| `PlaceBetAsync` | Validate Open status, `MarketAccessRules`, outcome enabled |
| LMSR | Update `YesVolume`/`NoVolume`; recalc probabilities via `LmsrCalculator` |
| Platform fee | Deduct `tenant.PlatformFeePercent` from effective bet or record separately |
| Traders | Increment `UniqueTradersCount` (HyperLogLog or HashSet per market — start simple) |
| Return | New odds snapshot + shares/price for bet slip |

### 2.3 User grain — extensions

| Method | Purpose |
|--------|---------|
| `DebitForBetAsync(amount, betSlipId)` | Idempotent debit linked to slip |
| `CreditWinningsAsync(amount, betSlipId)` | Settlement (Phase 5) |
| `FreezeAccountAsync` / `UnfreezeAsync` | Phase 7 |
| Enforce | Reject debit if `WalletStatus != Active` |

### 2.4 Transaction runner (wire existing stub)

File: `BetPlacementTransactionRunner.cs`

```text
1. Load tenant + market (access rules)
2. IUserGrain.DebitForBetAsync (or DebitAsync)
3. IMarketGrain.PlaceBetAsync
4. IBetSlipGrain.CreateAsync
5. Commit — any failure rolls back all
```

Use `[Transaction(TransactionOption.Create)]` on grain methods or `ITransactionClient` as now.

### 2.5 Application & API

```http
POST /api/tenants/{tenantId}/markets/{marketId}/bets
Body: { "outcome": "Yes", "amount": 50.00 }
Auth: required
Response: { betSlipId, oddsAtPlacement, newOdds, walletBalance }
```

| Feature | Handler |
|---------|---------|
| `PlaceBetCommand` | Calls `IBetPlacementTransactionRunner` |
| `GetMyBetsQuery` | From `BetHistoryProjection` |
| `GetBetSlipQuery` | Single slip detail |

### 2.6 Frontend

| UI | Work |
|----|------|
| Bet modal | Outcome toggle, amount input, estimated payout |
| Confirm step | Show odds lock disclaimer |
| Error states | Insufficient balance, market closed, frozen account |
| My Bets page | List open/settled slips |

### 2.7 Tests

- Concurrent bet load test (same market, 50 parallel requests)
- Transaction rollback when balance insufficient mid-flight
- Platform fee math correctness

**Phase 2 exit:** Logged-in user can bet; balance and market odds change correctly.

---

## Phase 3 — Real-Time UX

**Goal:** 5050-style live odds without page refresh.

**Duration estimate:** 1–2 weeks

### 3.1 Backend

| Task | Details |
|------|---------|
| SignalR hub | `MarketHub` — groups: `tenant:{id}`, `market:{id}` |
| Grain observer | `IMarketObserver` on `MarketGrain` after bet/state change |
| Bridge | Observer → `IHubContext<MarketHub>` |
| Events | `OddsUpdated`, `VolumeUpdated`, `MarketStatusChanged`, `BetSettled` (user-specific) |
| Auth | JWT for SignalR negotiate; tenant claim → group join |

**Payload example:**

```json
{
  "marketId": "...",
  "yesProbability": 0.29,
  "noProbability": 0.71,
  "yesOdds": 2.86,
  "noOdds": 1.11,
  "totalVolume": 367,
  "uniqueTraders": 28
}
```

### 3.2 Frontend

| Task | Details |
|------|---------|
| `@microsoft/signalr` | Client hook `useMarketUpdates(tenantId, marketIds)` |
| Market cards | Subscribe to listed markets; patch local state on event |
| Bet modal | Live odds refresh while open |
| Reconnect | Exponential backoff; refetch snapshot on reconnect |

**Phase 3 exit:** Multiple browser tabs see odds move when any user bets.

---

## Phase 4 — Money In / Out

**Goal:** Users fund wallets and withdraw to verified payout accounts.

**Duration estimate:** 2–3 weeks

### 4.1 Deposits

| Layer | Work |
|-------|------|
| Domain | `DepositRequest`, `DepositStatus` enum |
| Grain | `UserGrain.DepositAsync` exists — add idempotency key |
| Provider abstraction | `IPaymentProvider` in Infrastructure |
| Implementations | `SandboxPaymentProvider` (dev); later M-Pesa/card adapter |
| API | `POST .../users/me/deposits` → `{ amount, provider }` |
| Webhook | `POST /api/webhooks/payments/{provider}` → credit wallet |
| Ledger | Append-only `WalletTransaction` table for audit |

### 4.2 Withdrawals

| Layer | Work |
|-------|------|
| Rules | Require `KycStatus.Verified` + tenant `WithdrawalsEnabled` |
| Grain | `UserGrain.WithdrawAsync(amount)` — debit, pending payout record |
| Provider | Payout via linked `PayoutProvider` + `PayoutAccountId` |
| API | `POST .../users/me/withdrawals` |
| Limits | Min/max per tenant; daily cap on `UserState` (README daily limits) |

### 4.3 Frontend

| UI | Work |
|----|------|
| Wallet page | Balance, deposit, withdraw forms |
| Payout linking | Modal: provider + account id + verify flow |
| Currency toggle | USD/KES in header → existing `PATCH .../currency` |
| Transaction history | Deposits, withdrawals, bets |

**Phase 4 exit:** User can add funds (sandbox), bet, and request withdrawal after verification.

---

## Phase 5 — Settlement & Lifecycle

**Goal:** Complete market lifecycle through payout.

**Duration estimate:** 2 weeks

### 5.1 Resolution

| Task | Details |
|------|---------|
| `MarketGrain.ResolveAsync(outcome)` | Open/Closing → Resolved; lock betting |
| Admin API | `POST .../admin/markets/{id}/resolve` body `{ "winningOutcome": "Yes" }` |
| Validation | Only admin role; market past `TradingEndsAt` optional rule |

### 5.2 Settlement grain

| Task | Details |
|------|---------|
| `ISettlementGrain` | One per market resolution job |
| Batch | Page bet slips; credit winners via `UserGrain.CreditWinningsAsync` |
| Bet slip | `BetSlipGrain.SettleAsync(won, payoutAmount)` |
| Idempotency | Safe to retry batch |
| Complete | `MarketGrain.MarkSettledAsync()` |

### 5.3 Notifications

- SignalR `BetSettled` to user with win/loss amount
- Email/push (optional, later)

### 5.4 Frontend

- Market card badge: Resolved / Settled
- My Bets: Won/Lost column, payout amount
- Admin: resolve button + confirmation

**Phase 5 exit:** Full bet lifecycle from open market to wallet credit for winners.

---

## Phase 6 — Admin & White-Label

**Goal:** Tenant admins customize brand and operations without deploys.

**Duration estimate:** 2–3 weeks

### 6.1 Tenant admin API

```http
PATCH /api/tenants/{id}/theme        # CSS variable overrides JSON
PATCH /api/tenants/{id}/fees         # platform fee, max bet, liquidity b
PATCH /api/tenants/{id}/switches     # deposits, withdrawals, betting
PATCH /api/tenants/{id}/categories   # enabled category list
GET   /api/tenants/{id}/theme        # public — frontend bootstraps theme
```

Extend `TenantGrain` with update methods.

### 6.2 Theme system

| Task | Details |
|------|---------|
| Store | Theme JSON in grain + Redis cache |
| Frontend | On load: `GET theme` → apply CSS variables on `:root` |
| Theme editor | Admin UI: color pickers map to `--gn-*` tokens |
| Logo | URL field → header component |

### 6.3 Admin dashboard (React)

| Section | Features |
|---------|----------|
| Markets | Create, publish, close, resolve |
| Tenant settings | Fees, switches, categories |
| Theme | Live preview |
| Users | Search, freeze (Phase 7) |

### 6.4 Roles

| Role | Permissions |
|------|-------------|
| User | Bet, wallet, profile |
| TenantAdmin | Markets + tenant config for own tenant |
| PlatformAdmin | All tenants, fraud queue |

JWT claims: `role`, `tenant_id`.

**Phase 6 exit:** New tenant onboarded with custom colors/logo and fee structure.

---

## Phase 7 — Risk & Compliance

**Goal:** Protect platform from abuse before public launch.

**Duration estimate:** 1–2 weeks

### 7.1 Fraud detection grain

| Rule | Action |
|------|--------|
| > N bets in M seconds per user | Flag + optional auto-freeze |
| Same IP, multiple accounts | Sybil score (log IP on bet — middleware) |
| Arbitrage pattern | Alert admin (v1: manual review) |

`IFraudDetectionGrain` subscribes to bet events (Orleans streams or observer).

### 7.2 User controls

- `UserGrain.FreezeAccountAsync(reason)`
- Bet placement checks frozen status
- Admin unfreeze endpoint

### 7.3 API hardening

- Rate limiting (ASP.NET `RateLimiter` or gateway)
- Per-tenant bet limits (`MaxBetAmount` already on tenant)
- Responsible gaming: daily loss/deposit limits on `UserState`

**Phase 7 exit:** Velocity attack triggers freeze; admin can review and unfreeze.

---

## Phase 8 — Production Platform

**Goal:** Deploy safely at scale.

**Duration estimate:** 2–4 weeks

### 8.1 Infrastructure

| Item | Action |
|------|--------|
| EF migrations | CI step; run on deploy |
| Orleans silo | Separate host project optional; scale replicas in K8s |
| Health checks | `/health`, `/health/ready` (Postgres, Redis, Orleans) |
| Observability | OpenTelemetry traces; structured Serilog |
| Secrets | Env vars / vault; no keys in appsettings prod |
| Auth prod | Keycloak or Auth0; disable `AllowLocalAccounts` |
| CI/CD | Build, test, deploy pipeline (GitHub Actions) |
| Load tests | k6: list markets, place bet, 100 VUs |

### 8.2 API polish

- Version prefix `/api/v1/...`
- OpenAPI/Swagger document
- Consistent error schema (ProblemDetails)

### 8.3 Frontend production

- Environment config (`VITE_API_URL`)
- Build + static host or CDN
- Error boundary, loading skeletons
- E2E tests (Playwright): register → deposit → bet → see odds update

### 8.4 Documentation

- Runbook: deploy, rollback, Orleans dashboard
- Tenant onboarding guide
- Payment provider integration guide

**Phase 8 exit:** Staging environment passes load test; production checklist signed off.

---

## Cross-Cutting Standards

Apply in every phase:

| Area | Standard |
|------|----------|
| CQRS | MediatR command/query per feature folder |
| Validation | FluentValidation on all commands |
| Errors | `ValidationException` → 400; `BusinessRuleException` → 409 |
| Contracts | DTOs in `Goaname.Contracts` only |
| Grains | Interfaces in `Goaname.Grains.Interfaces`; `[Alias]` on methods |
| Tests | Unit (Domain, Application validators); integration (Testcontainers Postgres) |
| Frontend | `api/` modules, hooks for data, components presentational |
| Git | Feature branches; PR per phase or sub-feature |

---

## Dependency Graph

```text
Phase 1 (Markets)
    │
    ▼
Phase 2 (Betting) ──────────────────┐
    │                                │
    ├──────────────► Phase 3 (SignalR)
    │
    ▼
Phase 4 (Payments) ──► Phase 5 (Settlement)
    │
    ▼
Phase 6 (Admin/Theme)     Phase 7 (Fraud)
    │                          │
    └──────────┬───────────────┘
               ▼
         Phase 8 (Production)
```

Phases 6 and 7 can overlap after Phase 2. Phase 4 can start in parallel with Phase 3.

---

## Rough Timeline

| Phase | Focus | Estimate |
|-------|--------|----------|
| 1 | Market engine | 1–2 weeks |
| 2 | Betting + ACID | 2–3 weeks |
| 3 | SignalR | 1–2 weeks |
| 4 | Deposits / withdrawals | 2–3 weeks |
| 5 | Settlement | 2 weeks |
| 6 | Admin + theming | 2–3 weeks |
| 7 | Fraud + limits | 1–2 weeks |
| 8 | Production | 2–4 weeks |
| **Total** | | **~13–22 weeks** (1 dev) |

With 2–3 engineers working in parallel on backend/frontend/infra: **~8–12 weeks** to full-fledged v1.

---

## Suggested Next Sprint (Week 1)

Priority order for immediate impact:

1. `IMarketGrain` + `MarketGrain` (create, publish, get odds)
2. `ListMarkets` + `GetMarket` queries + EF projection registration
3. Market API endpoints (public list/detail)
4. Frontend: replace mock data with API
5. Admin endpoint: create + publish one seed market for demo tenant

**Deliverable:** Demo tenant with 5+ real markets visible after login — foundation for Phase 2 betting.

---

## File / Folder Checklist (new work)

```text
src/Goaname.Grains.Interfaces/IMarketGrain.cs
src/Goaname.Grains.Interfaces/IBetSlipGrain.cs
src/Goaname.Grains.Interfaces/ISettlementGrain.cs
src/Goaname.Grains.Interfaces/IFraudDetectionGrain.cs
src/Goaname.Grains/MarketGrain.cs
src/Goaname.Grains/BetSlipGrain.cs
src/Goaname.Grains/SettlementGrain.cs
src/Goaname.Grains/FraudDetectionGrain.cs
src/Goaname.Application/Features/Markets/...
src/Goaname.Application/Features/Bets/...
src/Goaname.Application/Features/Deposits/...
src/Goaname.Application/Features/Withdrawals/...
src/Goaname.Application/Features/Admin/...
src/Goaname.Contracts/Markets/...
src/Goaname.Contracts/Bets/...
src/Goaname.Presentation/Endpoints/MarketEndpoints.cs
src/Goaname.Presentation/Endpoints/BetEndpoints.cs
src/Goaname.Presentation/Endpoints/AdminEndpoints.cs
src/Goaname.Presentation/Hubs/MarketHub.cs
src/Goaname.Infrastructure/Payments/...
src/Goaname.Infrastructure/DependencyInjection.cs  (DbContext, providers)
src/Goaname.Frontend/src/pages/MarketsPage.tsx
src/Goaname.Frontend/src/pages/WalletPage.tsx
src/Goaname.Frontend/src/pages/MyBetsPage.tsx
src/Goaname.Frontend/src/pages/admin/...
src/Goaname.Frontend/src/hooks/useMarketUpdates.ts
```

---

## Related Docs

- [REMAINING_USE_CASES.md](./REMAINING_USE_CASES.md) — gap analysis vs README use cases
- [README.md](../README.md) — product vision and formulas
- [deployment/.env.example](../deployment/.env.example) — production configuration

---

*Last updated: aligned with `feature/user-auth-and-wallet` branch.*
