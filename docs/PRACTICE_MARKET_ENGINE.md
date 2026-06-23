# Practice Guide: Market Engine (Browse Markets)

Use this doc to implement **Phase 1** yourself — one vertical slice from grain → API → UI.

**Use case:** An admin creates and publishes a market; a logged-in user sees it in the market grid with live Yes/No odds from LMSR (no betting yet).

**Time estimate:** 4–8 hours if you follow existing patterns (`UserGrain`, `GetTenantQuery`, `TenantEndpoints`).

---

## What you will build

| Layer | Deliverable |
|-------|-------------|
| Grain | `IMarketGrain` + `MarketGrain` (create, publish, get state, get odds) |
| Catalog | `IMarketCatalogGrain` per tenant (list open market IDs — skip EF for now) |
| Application | MediatR commands/queries + DTOs |
| API | REST endpoints under `/api/tenants/{tenantId}/markets` |
| Frontend | Replace `mockMarkets.ts` with real API calls |

**Out of scope for this practice:** bet placement, SignalR, EF `MarketProjection` sync, admin auth roles. Add those in a later pass.

---

## Before you start

### 1. Run the stack

```bash
# Postgres (port 5433 if 5432 is taken) + Redis
docker start goaname-postgres goaname-redis

# API
ConnectionStrings__Postgres='Host=localhost;Port=5433;Database=goaname;Username=postgres;Password=postgres' \
  dotnet run --project src/Goaname.Presentation

# Frontend
cd src/Goaname.Frontend && npm run dev
```

### 2. Create a practice branch

```bash
git checkout -b practice/market-engine
```

### 3. Study these reference files (copy the patterns)

| Pattern | File |
|---------|------|
| Grain interface | `src/Goaname.Grains.Interfaces/IUserGrain.cs` |
| Grain implementation | `src/Goaname.Grains/UserGrain.cs` |
| Grain key | `src/Goaname.Grains.Interfaces/GrainKeys.cs` → already has `Market(...)` |
| Query + handler | `src/Goaname.Application/Features/Tenants/GetTenant/` |
| Endpoints | `src/Goaname.Presentation/Endpoints/TenantEndpoints.cs` |
| LMSR math | `src/Goaname.Domain/Math/LmsrCalculator.cs` |
| Market state | `src/Goaname.Domain/State/MarketState.cs` |

---

## Architecture flow

```text
React (MarketsPage)
    │  GET /api/tenants/{tenantId}/markets
    ▼
MarketEndpoints  →  MediatR  →  ListMarketsQueryHandler
                                    │
                                    ▼
                         IMarketCatalogGrain (tenant key)
                                    │
                         for each marketId → IMarketGrain.GetStateAsync()
                                    │
                                    ▼
                              MarketDto[]

Admin POST create/publish
    ▼
CreateMarketCommandHandler → IMarketGrain.CreateAsync()
                          → IMarketCatalogGrain.RegisterAsync(marketId)
PublishMarketCommandHandler → IMarketGrain.PublishAsync()
```

**Why a catalog grain?** Orleans has no “list all grains.” For practice, one `MarketCatalogGrain` per tenant holds published market IDs. Later you can replace this with EF `MarketProjection` (see `docs/FULL_APPLICATION_PLAN.md` §1.3).

---

## Step-by-step implementation

Work in order. **Do not move to the next step until the checkpoint passes.**

---

### Step 1 — `IMarketGrain` interface

**Create:** `src/Goaname.Grains.Interfaces/IMarketGrain.cs`

Mirror `IUserGrain` — Orleans needs `[Alias]` on the interface and each method:

```csharp
using Goaname.Domain.State;
using Goaname.Contracts.Markets;

namespace Goaname.Grains.Interfaces;

[Alias("Goaname.Grains.Interfaces.IMarketGrain")]
public interface IMarketGrain : IGrainWithStringKey
{
    [Alias("GetStateAsync")]
    Task<MarketState> GetStateAsync();

    [Alias("CreateAsync")]
    Task CreateAsync(string tenantId, string title, string category,
        DateTimeOffset tradingEndsAt, decimal? liquidityParameter);

    [Alias("PublishAsync")]
    Task PublishAsync();

    [Alias("GetOddsAsync")]
    Task<OddsSnapshot> GetOddsAsync();
}
```

**What each method does:**

| Method | Purpose | UserGrain equivalent |
|--------|---------|---------------------|
| `GetStateAsync` | Return full persisted `MarketState` | Same one-liner |
| `CreateAsync` | First-time setup → `Draft`, hidden | `InitializeAsync` |
| `PublishAsync` | `Draft` → `Open`, visible in catalog | `VerifyPayoutAccountAsync` (state transition + rules) |
| `GetOddsAsync` | Live Yes/No prices from LMSR (no state change) | *(new — computed read)* |

**Create:** `src/Goaname.Contracts/Markets/OddsSnapshot.cs`

```csharp
namespace Goaname.Contracts.Markets;

public sealed record OddsSnapshot(
    decimal YesProbability,
    decimal NoProbability,
    decimal YesMultiplier,  // e.g. 1 / YesProbability for display
    decimal NoMultiplier);
```

**Checkpoint:** Project builds. No grain implementation yet.

---

### Step 2 — `MarketGrain` implementation

**Create:** `src/Goaname.Grains/MarketGrain.cs`

Copy the persistent-state pattern from `UserGrain.cs`:

- Inject `[PersistentState("market", "GoanameStore")] IPersistentState<MarketState>`
- If `Id == Guid.Empty`, grain is uninitialized (same as user grain before `InitializeAsync`)

#### Grain skeleton

```csharp
using Goaname.Contracts.Markets;
using Goaname.Domain.Enums;
using Goaname.Domain.Exceptions;
using Goaname.Domain.Math;
using Goaname.Domain.State;
using Goaname.Grains.Interfaces;
using Orleans.Runtime;

namespace Goaname.Grains;

public class MarketGrain : Grain, IMarketGrain
{
    private readonly IPersistentState<MarketState> _state;

    public MarketGrain(
        [PersistentState("market", "GoanameStore")]
        IPersistentState<MarketState> state)
    {
        _state = state;
    }

    // methods below...
}
```

#### `GetStateAsync`

One-liner — identical to `UserGrain`:

```csharp
public Task<MarketState> GetStateAsync() => Task.FromResult(_state.State);
```

#### `CreateAsync`

Like `UserGrain.InitializeAsync`: validate → guard “already exists” → fill state → save.

```csharp
public async Task CreateAsync(string tenantId, string title, string category,
    DateTimeOffset tradingEndsAt, decimal? liquidityParameter)
{
    ArgumentException.ThrowIfNullOrWhiteSpace(tenantId);
    ArgumentException.ThrowIfNullOrWhiteSpace(title);
    ArgumentException.ThrowIfNullOrWhiteSpace(category);

    if (_state.State.Id != Guid.Empty)
        throw new BusinessRuleException("Market already exists.");

    if (tradingEndsAt <= DateTimeOffset.UtcNow)
        throw new BusinessRuleException("Trading end date must be in the future.");

    var marketId = ParseMarketIdFromKey(this.GetPrimaryKeyString());
    decimal b = liquidityParameter ?? await GetTenantDefaultLiquidityAsync(tenantId);
    var (pYes, pNo) = LmsrCalculator.CalculateProbabilities(0, 0, b);
    var now = DateTimeOffset.UtcNow;

    _state.State.Id = marketId;
    _state.State.TenantId = tenantId;
    _state.State.Title = title;
    _state.State.Category = category;
    _state.State.TradingEndsAt = tradingEndsAt;
    _state.State.CreatedAt = now;
    _state.State.Status = MarketStatus.Draft;
    _state.State.IsVisible = false;
    _state.State.LiquidityParameter = b;
    _state.State.YesVolume = 0;
    _state.State.NoVolume = 0;
    _state.State.YesProbability = pYes;
    _state.State.NoProbability = pNo;

    await _state.WriteStateAsync().ConfigureAwait(true);
}
```

**Key points:**

1. `marketId` comes from the grain key (`demo_market_{guid}`), not from the caller
2. `liquidityParameter` (`b` in LMSR) defaults to `TenantState.DefaultLiquidityParameter`
3. At zero volume, LMSR gives ~50/50 probabilities

#### `PublishAsync`

Like `VerifyPayoutAccountAsync` — rule checks, state transition, save, then register in catalog:

```csharp
public async Task PublishAsync()
{
    EnsureCreated();

    if (_state.State.Status != MarketStatus.Draft)
        throw new BusinessRuleException("Only draft markets can be published.");

    if (_state.State.TradingEndsAt <= DateTimeOffset.UtcNow)
        throw new BusinessRuleException("Cannot publish: trading window has ended.");

    _state.State.Status = MarketStatus.Open;
    _state.State.IsVisible = true;
    await _state.WriteStateAsync().ConfigureAwait(true);

    var catalog = GrainFactory.GetGrain<IMarketCatalogGrain>(
        GrainKeys.MarketCatalog(_state.State.TenantId));
    await catalog.RegisterAsync(_state.State.Id).ConfigureAwait(true);
}
```

#### `GetOddsAsync`

Computed read — recalculates from current volumes, returns UI-friendly snapshot:

```csharp
public Task<OddsSnapshot> GetOddsAsync()
{
    EnsureCreated();

    var s = _state.State;
    var (pYes, pNo) = LmsrCalculator.CalculateProbabilities(
        s.YesVolume, s.NoVolume, s.LiquidityParameter);

    const decimal floor = 0.01m;
    return Task.FromResult(new OddsSnapshot(
        YesProbability: pYes,
        NoProbability: pNo,
        YesMultiplier: 1m / Math.Max(pYes, floor),
        NoMultiplier: 1m / Math.Max(pNo, floor)));
}
```

At zero volume: ~50/50 probabilities → multipliers ~2.0x each.

#### Private helpers

```csharp
private static Guid ParseMarketIdFromKey(string key)
{
    // "demo_market_{guid}" → last segment is the Guid
    return Guid.Parse(key.Split('_')[^1]);
}

private async Task<decimal> GetTenantDefaultLiquidityAsync(string tenantId)
{
    var tenant = GrainFactory.GetGrain<ITenantGrain>(GrainKeys.Tenant(tenantId));
    var tenantState = await tenant.GetStateAsync().ConfigureAwait(true);
    return tenantState.DefaultLiquidityParameter;
}

private void EnsureCreated()
{
    if (_state.State.Id == Guid.Empty)
        throw new BusinessRuleException("Market has not been created.");
}
```

#### Lifecycle (how the four methods fit together)

```text
Admin: CreateAsync(...)     →  Draft, hidden, 50/50 odds stored
Admin: PublishAsync()       →  Open, visible, registered in catalog
User:  GetStateAsync()      →  title, category, volume, status, end date
User:  GetOddsAsync()       →  Yes 62%, No 38%, multipliers for cards
(Later) PlaceBetAsync       →  volumes change → GetOddsAsync returns new prices
```

**Important:** Generate `marketId` in the **MediatR handler**, not inside the grain:

```csharp
var marketId = Guid.NewGuid();
var grain = grainFactory.GetGrain<IMarketGrain>(
    GrainKeys.Market(request.TenantId, marketId));
await grain.CreateAsync(...);
```

**Checkpoint — manual grain test (optional):** Add a temporary dev endpoint or use Orleans dashboard to confirm grain activates. Easier to wait until Step 5.

---

### Step 3 — `IMarketCatalogGrain` (listing helper)

**Create:** `src/Goaname.Grains.Interfaces/IMarketCatalogGrain.cs`

```csharp
Task RegisterAsync(Guid marketId);
Task<IReadOnlyList<Guid>> GetPublishedMarketIdsAsync();
```

**Add to `GrainKeys.cs`:**

```csharp
public static string MarketCatalog(string tenantId) => $"{tenantId}_marketcatalog";
```

**Create:** `src/Goaname.Grains/MarketCatalogGrain.cs`

- State: `List<Guid> PublishedMarketIds` (add a small `[GenerateSerializer]` state class)
- `RegisterAsync`: append if not present (idempotent)
- `GetPublishedMarketIdsAsync`: return copy of list

**Wire catalog on publish:** In `PublishAsync`, after state write, call:

```csharp
var catalog = GrainFactory.GetGrain<IMarketCatalogGrain>(GrainKeys.MarketCatalog(_state.State.TenantId));
await catalog.RegisterAsync(_state.State.Id);
```

**Checkpoint:** Build succeeds.

---

### Step 4 — Contracts (DTOs)

**Create folder:** `src/Goaname.Contracts/Markets/`

| File | Purpose |
|------|---------|
| `MarketDto.cs` | Public API shape: id, title, category, status, yes/no %, multipliers, volume, traders, tradingEndsAt |
| `CreateMarketRequest.cs` | `{ title, category, tradingEndsAt, liquidityParameter? }` |
| `ListMarketsResponse.cs` | `{ items: MarketDto[] }` optional wrapper |

Map from `MarketState` + `OddsSnapshot` in handlers (same as `GetTenantQueryHandler.MapToDto`).

---

### Step 5 — Application layer (MediatR)

**Create feature folders** under `src/Goaname.Application/Features/Markets/`:

| Folder | Type | Notes |
|--------|------|-------|
| `CreateMarket/` | `CreateMarketCommand` + handler | Generate `Guid marketId`; get grain with `GrainKeys.Market(tenantId, marketId)` |
| `PublishMarket/` | `PublishMarketCommand` + handler | tenantId + marketId |
| `GetMarket/` | `GetMarketQuery` + handler | Returns `MarketDto` with odds |
| `ListMarkets/` | `ListMarketsQuery` + handler | Catalog IDs → filter `Open` + `IsVisible` → map each |

**Handler pattern** (copy from `GetTenantQueryHandler.cs`):

**GetMarket:**

```csharp
public sealed class GetMarketQueryHandler(IGrainFactory grainFactory)
    : IRequestHandler<GetMarketQuery, MarketDto>
{
    public async Task<MarketDto> Handle(GetMarketQuery request, CancellationToken cancellationToken)
    {
        var grain = grainFactory.GetGrain<IMarketGrain>(
            GrainKeys.Market(request.TenantId, request.MarketId));
        var state = await grain.GetStateAsync().ConfigureAwait(false);
        var odds = await grain.GetOddsAsync().ConfigureAwait(false);
        return MapToDto(state, odds);
    }
}
```

**CreateMarket** — generate `marketId` here, then pass to grain key:

```csharp
public sealed class CreateMarketCommandHandler(IGrainFactory grainFactory)
    : IRequestHandler<CreateMarketCommand, MarketDto>
{
    public async Task<MarketDto> Handle(CreateMarketCommand request, CancellationToken cancellationToken)
    {
        var marketId = Guid.NewGuid();
        var grain = grainFactory.GetGrain<IMarketGrain>(
            GrainKeys.Market(request.TenantId, marketId));

        await grain.CreateAsync(
            request.TenantId,
            request.Title,
            request.Category,
            request.TradingEndsAt,
            request.LiquidityParameter).ConfigureAwait(false);

        var state = await grain.GetStateAsync().ConfigureAwait(false);
        var odds = await grain.GetOddsAsync().ConfigureAwait(false);
        return MapToDto(state, odds);
    }
}
```

**Validators (FluentValidation if project uses it, else guard in handler):**

- Title: 3–200 chars
- Category: non-empty; optionally check tenant `EnabledCategories`
- `tradingEndsAt`: must be in the future on create

**Checkpoint — API only:**

```bash
# 1. Initialize tenant (if needed)
curl -X POST http://localhost:5107/api/tenants/demo/initialize \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo","currency":"USD"}'

# 2. Create market (returns marketId in Location header or body)
curl -X POST http://localhost:5107/api/tenants/demo/admin/markets \
  -H "Content-Type: application/json" \
  -d '{"title":"Will it rain tomorrow?","category":"weather","tradingEndsAt":"2026-12-31T23:59:59Z"}'

# 3. Publish
curl -X POST http://localhost:5107/api/tenants/demo/admin/markets/{marketId}/publish

# 4. List
curl http://localhost:5107/api/tenants/demo/markets

# 5. Single + odds
curl http://localhost:5107/api/tenants/demo/markets/{marketId}
curl http://localhost:5107/api/tenants/demo/markets/{marketId}/odds
```

Expected: list returns one market; odds ~50/50 at zero volume with equal probabilities.

---

### Step 6 — API endpoints

**Create:** `src/Goaname.Presentation/Endpoints/MarketEndpoints.cs`

```http
GET    /api/tenants/{tenantId}/markets
GET    /api/tenants/{tenantId}/markets/{marketId}
GET    /api/tenants/{tenantId}/markets/{marketId}/odds
POST   /api/tenants/{tenantId}/admin/markets
POST   /api/tenants/{tenantId}/admin/markets/{marketId}/publish
```

**Register in `Program.cs`:**

```csharp
app.MapMarketEndpoints();
```

**Auth (minimal for practice):**

- `GET` markets: allow anonymous OR require JWT (your choice; match product: public browse)
- `POST` admin: require `[Authorize]` — for practice, no admin role check yet

**Checkpoint:** All curl commands above return 200/201.

---

### Step 7 — Frontend

**Create:** `src/Goaname.Frontend/src/api/markets.ts`

```typescript
export async function listMarkets(tenantId: string): Promise<MarketDto[]> { ... }
export async function getMarket(tenantId: string, marketId: string): Promise<MarketDto> { ... }
```

Use the same fetch/error pattern as `src/api/users.ts` and `src/api/client.ts`.

**Update:** Replace imports of `mockMarkets` in `App.tsx` (or extract `MarketsPage`) with:

1. `useEffect` → `listMarkets(tenantId)` when user is logged in
2. Map API fields to existing card props (title, yes/no %, volume, traders, days left)

**Optional:** Simple admin panel section — form with title/category/end date → create → publish → refresh list.

**Checkpoint:** Log in, see real markets from API instead of hardcoded mock data.

---

## Definition of done (your practice is complete when)

- [ ] Admin can create a draft market via API
- [ ] Admin can publish it; it appears in `GET .../markets`
- [ ] Odds endpoint returns Yes/No probabilities from `LmsrCalculator`
- [ ] Frontend market grid loads from API
- [ ] Creating a second market and publishing shows both in the list
- [ ] Restarting the API does not lose markets (Orleans Postgres persistence)

---

## Common pitfalls

| Problem | Fix |
|---------|-----|
| Grain not found / empty state | Check grain key matches `GrainKeys.Market(tenantId, marketId)` exactly |
| Orleans serialization error | Ensure `MarketState` and catalog state have `[GenerateSerializer]` / `[Id(n)]` |
| 409 on publish | Market already published or `TradingEndsAt` in the past |
| List empty after publish | Forgot `MarketCatalogGrain.RegisterAsync` in `PublishAsync` |
| Odds NaN or huge multipliers | Guard division when probability is 0 |
| CORS errors | Frontend must use `/api/...` via Vite proxy, not direct `:5107` |

---

## Suggested order if you get stuck

1. **Smallest slice:** `GetMarket` only — hard-code a market by calling grain from a throwaway test or dev script
2. **Then:** `CreateMarket` + `PublishMarket`
3. **Then:** catalog + `ListMarkets`
4. **Last:** frontend wiring

---

## After this practice

| Next topic | Doc |
|------------|-----|
| EF read model instead of catalog grain | `docs/FULL_APPLICATION_PLAN.md` §1.3 |
| Place bet + wallet debit | Phase 2 in same doc |
| All remaining gaps | `docs/REMAINING_USE_CASES.md` |

---

## Quick reference: file checklist

```text
src/Goaname.Grains.Interfaces/
  IMarketGrain.cs          ← Step 1
  IMarketCatalogGrain.cs   ← Step 3

src/Goaname.Grains/
  MarketGrain.cs           ← Step 2
  MarketCatalogGrain.cs    ← Step 3

src/Goaname.Contracts/Markets/
  MarketDto.cs             ← Step 4
  OddsSnapshot.cs
  CreateMarketRequest.cs

src/Goaname.Application/Features/Markets/
  CreateMarket/
  PublishMarket/
  GetMarket/
  ListMarkets/

src/Goaname.Presentation/Endpoints/
  MarketEndpoints.cs       ← Step 6

src/Goaname.Frontend/src/
  api/markets.ts           ← Step 7
  (update App.tsx or MarketsPage)
```

Good luck — implement one step, run the checkpoint, commit, repeat.
