# Goaname Use Cases — Status & Remaining Work

This document maps the platform use cases from the README and roadmap to what is **done**, **partial**, or **not started** as of the `feature/user-auth-and-wallet` branch.

---

## Summary

| Phase | Focus | Status |
|-------|--------|--------|
| Phase 1 | Core grains (User, Market, BetSlip), persistence | **Partial** — User/Tenant grains exist; Market & BetSlip grains missing |
| Phase 2 | AMM & ACID bet transactions | **Partial** — LMSR math exists; bet placement is stubbed |
| Phase 3 | Multi-tenant, CSS theming, theme editor | **Partial** — Tenant API + CSS tokens; no theme editor |
| Phase 4 | Real-time (SignalR), scale | **Not started** |
| Phase 5 | Fraud, settlement, production KYC/payments | **Not started** |

---

## Use Case 1: Tenant Admin Customizing the Platform

**Actor:** Tenant Administrator  
**Goal:** White-label the platform (brand, fees, categories) without redeploying code.

| Step | Description | Status |
|------|-------------|--------|
| 1 | Admin logs into Tenant Dashboard | Not started |
| 2 | Theme Editor — colors, fonts, logo | Not started |
| 3 | Update `TenantGrain` theme/config | Partial — `TenantState.ThemeKey` exists; no theme API |
| 4 | Frontend applies CSS variables live | Partial — `theme.css` tokens exist; no tenant fetch/apply |
| 5 | Configure platform fee (e.g. 2.5%) | Partial — `PlatformFeePercent` on tenant; no admin UI/API to change |

**Remaining**

- [ ] Admin authentication & roles (Admin policy exists only for Orleans dashboard)
- [ ] `PATCH /api/tenants/{id}/theme` — theme JSON / CSS variable overrides
- [ ] `PATCH /api/tenants/{id}/fees` — platform fee, max bet, liquidity defaults
- [ ] Tenant Dashboard + Theme Editor UI
- [ ] Theme storage (DB/Redis) and hot-reload on frontend

---

## Use Case 2: User Registration, Wallet & Profile

**Actor:** End User  
**Goal:** Create account, sign in, view balance, link payout account.

| Step | Description | Status |
|------|-------------|--------|
| 1 | Register with email/password | **Done** — `POST /api/auth/register` |
| 2 | Login | **Done** — `POST /api/auth/login` |
| 3 | JWT-protected profile | **Done** — `GET /api/tenants/{id}/users/me` |
| 4 | Wallet balance | **Done** — `GET .../users/me/wallet` |
| 5 | Preferred currency (USD/KES) | **Done** — `PATCH .../users/me/currency` |
| 6 | Link payout account (generic) | **Done** — `POST .../users/me/payout-account` |
| 7 | Verify payout account | **Done** (stub) — `POST .../payout-account/verify` |
| 8 | Deposit funds | Partial — `UserGrain.DepositAsync` exists; no API/payment integration |
| 9 | Withdraw funds | Not started |
| 10 | Bet history | Not started — EF projection defined; not wired |

**Remaining**

- [ ] `POST /api/tenants/{id}/users/me/deposit` — payment provider integration
- [ ] `POST /api/tenants/{id}/users/me/withdraw` — requires verified payout account
- [ ] `GET /api/tenants/{id}/users/me/bets` — bet history from projections
- [ ] Production auth (external IdP) instead of local accounts only
- [ ] Real payout verification (mobile-money/bank providers, not stub verify)
- [ ] Frontend: deposit/withdraw flows, payout linking UI, currency toggle in header

---

## Use Case 3: Browse & Search Markets

**Actor:** End User (guest or logged in)  
**Goal:** Discover prediction markets by category and keyword.

| Step | Description | Status |
|------|-------------|--------|
| 1 | List open markets | Not started |
| 2 | Filter by category | Not started — frontend uses mock data only |
| 3 | Search by keyword | Not started |
| 4 | Market card — odds, volume, traders | Partial — mock cards in UI; no API |

**Remaining**

- [ ] `IMarketGrain` + `MarketGrain` — create, open, close, AMM state
- [ ] `GET /api/tenants/{id}/markets` — list with filters (category, status)
- [ ] `GET /api/tenants/{id}/markets/{marketId}` — detail + current odds
- [ ] Sync `MarketProjection` (EF) for read-heavy listing
- [ ] Frontend: wire market grid to API; search & category tabs

---

## Use Case 4: User Placing a Bet (High Concurrency)

**Actor:** End User (Bettor)  
**Goal:** Place a bet; balance debited, odds updated atomically.

| Step | Description | Status |
|------|-------------|--------|
| 1 | View live odds | Not started — no SignalR |
| 2 | Enter amount & outcome, place bet | Not started |
| 3 | Route to `MarketGrain` | Not started |
| 4 | ACID transaction: debit user, update AMM, create bet slip | Partial — `BetPlacementTransactionRunner` is stub |
| 5 | Rollback on insufficient funds | Partial — `UserGrain.DebitAsync` exists |
| 6 | Push odds update to all clients | Not started |

**Remaining**

- [ ] `IBetSlipGrain` + `BetSlipGrain`
- [ ] `IMarketGrain.PlaceBetAsync` — LMSR via `LmsrCalculator`
- [ ] Wire `BetPlacementTransactionRunner` to User/Market/BetSlip grains
- [ ] `POST /api/tenants/{id}/markets/{marketId}/bets` (auth required)
- [ ] `MarketAccessRules` enforcement in handler
- [ ] SignalR hub for odds/volume/trader count updates
- [ ] Frontend: bet slip modal, confirmation, error handling

---

## Use Case 5: Market Lifecycle (Admin)

**Actor:** Tenant / System Admin  
**Goal:** Create, publish, close, and resolve markets.

| Step | Description | Status |
|------|-------------|--------|
| 1 | Create market (draft) | Not started |
| 2 | Publish / open for betting | Not started |
| 3 | Close (no new bets) | Not started |
| 4 | Resolve outcome (Yes/No) | Not started |
| 5 | State machine: Draft → Open → Closing → Resolved → Settled | Partial — `MarketStatus` enum + `MarketState` only |

**Remaining**

- [ ] Admin endpoints: create, publish, close, resolve market
- [ ] `MarketGrain` lifecycle methods aligned with `MarketStatus`
- [ ] Admin UI or API docs for market management
- [ ] Optional: user-created markets (“+ Create” in UI)

---

## Use Case 6: Market Resolution & Automated Settlement

**Actor:** System Admin or Oracle  
**Goal:** Resolve market and pay winners.

| Step | Description | Status |
|------|-------------|--------|
| 1 | Oracle submits winning outcome | Not started |
| 2 | `MarketGrain` → Resolved | Not started |
| 3 | `SettlementGrain` batch payouts | Not started |
| 4 | Credit winning `UserGrain` wallets | Partial — no `CreditAsync` / settle bet on user grain |
| 5 | Market → Settled | Not started |
| 6 | Push win notifications (SignalR) | Not started |

**Remaining**

- [ ] `ISettlementGrain` + batch processing
- [ ] `UserGrain.SettleBetAsync` / credit winnings
- [ ] `BetSlipGrain.SettleBetSlipAsync`
- [ ] `POST /api/admin/markets/{id}/resolve`
- [ ] Idempotent settlement + compensation on partial failure
- [ ] Frontend: notification toast / bet history “Won/Lost”

---

## Use Case 7: Fraud Detection & Risk Mitigation

**Actor:** Background system  
**Goal:** Detect abuse and freeze accounts.

| Step | Description | Status |
|------|-------------|--------|
| 1 | Detect bet velocity / pattern anomalies | Not started |
| 2 | `FraudDetectionGrain` on bet stream | Not started |
| 3 | `UserGrain.FreezeAccountAsync` | Not started — `WalletStatus.Frozen` exists |
| 4 | Reject bets from frozen users | Not started |
| 5 | Admin alert dashboard | Not started |

**Remaining**

- [ ] `IFraudDetectionGrain` + rules (velocity, sybil, arbitrage)
- [ ] `UserGrain.FreezeAccountAsync` / unfreeze
- [ ] Rate limiting at API (tenant + user)
- [ ] Admin fraud review UI

---

## Use Case 8: Real-Time Platform Updates

**Actor:** All connected clients  
**Goal:** Live odds, volume, status, personal settlements.

| Event | Status |
|-------|--------|
| Odds updates after bet | Not started |
| Volume / trader count changes | Not started |
| Market status (Open → Closed) | Not started |
| Personal settlement notifications | Not started |

**Remaining**

- [ ] SignalR hub + Orleans grain observers
- [ ] Frontend SignalR client subscription
- [ ] Reconnection & tenant-scoped groups

---

## Use Case 9: Multi-Tenant Operations

**Actor:** Platform operator  
**Goal:** Isolate tenants, configure per-tenant switches.

| Capability | Status |
|------------|--------|
| Tenant grain + key convention | **Done** |
| Initialize tenant | **Done** — `POST /api/tenants/{id}/initialize` |
| Get tenant config | **Done** — `GET /api/tenants/{id}` |
| Toggle betting | **Done** — `POST /api/tenants/{id}/betting` |
| Deposits/withdrawals toggles | Partial — on `TenantState`; no update API |
| Category allow-list | Partial — model only |
| Per-tenant theme | Not started |

**Remaining**

- [ ] `PATCH /api/tenants/{id}/deposits`, `/withdrawals`, `/categories`
- [ ] Tenant-scoped market/user isolation tests
- [ ] Tenant onboarding flow for new brands

---

## API Checklist (README vs Implemented)

| Planned (README) | Implemented | Remaining |
|------------------|-------------|-----------|
| `GET /api/v1/markets` | — | List markets API |
| `GET /api/v1/markets/{id}/odds` | — | Odds endpoint |
| `POST /api/v1/markets/{id}/bet` | — | Place bet |
| `GET /api/v1/users/{id}/balance` | `GET .../users/me/wallet` | Done (current user) |
| `POST /api/v1/users/{id}/deposit` | — | Deposit |
| `GET /api/v1/tenants/{id}/config` | `GET /api/tenants/{id}` | Theme slice missing |
| `POST /api/v1/admin/markets/{id}/resolve` | — | Resolve market |
| — | `POST /api/auth/register` | Done |
| — | `POST /api/auth/login` | Done |
| — | User profile / payout / currency | Done |

---

## Grains Checklist

| Grain | Status | Notes |
|-------|--------|-------|
| `TenantGrain` | **Done** | Initialize, betting toggle |
| `UserGrain` | **Done** | Wallet, debit/deposit, payout link, currency |
| `UserAuthGrain` | **Done** | Register/login credentials |
| `MarketGrain` | **Not started** | AMM, lifecycle, trader count |
| `BetSlipGrain` | **Not started** | Immutable bet record |
| `SettlementGrain` | **Not started** | Batch payouts |
| `FraudDetectionGrain` | **Not started** | Velocity / sybil |

---

## Frontend Checklist

| Feature | Status |
|---------|--------|
| Login / Register | **Done** |
| Market grid (mock) | Partial |
| Wallet balance in header | **Done** |
| Logout | **Done** |
| Payout verification banner | Partial — static message |
| USD/KES toggle | Not started in UI |
| Theme toggle | Partial — local only |
| Search & category filters | Not started (mock categories only) |
| Place bet flow | Not started |
| Real-time odds | Not started |
| Admin / tenant dashboard | Not started |

---

## Infrastructure & Production (Remaining)

- [ ] Register `GoanameDbContext` in DI; run EF migrations for projections
- [ ] Background workers: Orleans state → `MarketProjection` / `BetHistoryProjection`
- [ ] Event sourcing / audit log for transactions
- [ ] Payment provider adapters (deposit/withdraw)
- [ ] KYC provider integration (replace stub payout verify)
- [ ] API versioning (`/api/v1/...`)
- [ ] Rate limiting & API gateway (e.g. APISIX)
- [ ] Kubernetes / container deployment manifests beyond local Docker Compose
- [ ] Load testing for concurrent betting

---

## Suggested Implementation Order

1. **MarketGrain + list/detail APIs** — unlock real market UI  
2. **Bet placement transaction** — User + Market + BetSlip grains  
3. **SignalR** — live odds on market cards  
4. **Deposit API** — stub or sandbox payment provider  
5. **Market resolve + SettlementGrain** — complete bet lifecycle  
6. **Theme admin + tenant dashboard** — Use Case 1  
7. **FraudDetectionGrain + rate limits** — Use Case 7  
8. **Production hardening** — external auth, observability, CI/CD  

---

## References

- [README.md](../README.md) — full platform design  
- [deployment/.env.example](../deployment/.env.example) — production env vars  
- Roadmap phases: README § Implementation Roadmap  
