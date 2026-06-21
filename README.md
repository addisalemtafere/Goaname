# 🏆 Goaname - Complete Orleans Prediction Market Platform

> **Build a production-ready prediction market platform like 5050markets.com using Microsoft Orleans**

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Core Business Logic](#core-business-logic)
- [Orleans Multi-Tenant Architecture](#orleans-multi-tenant-architecture)
- [Wallet Management System](#wallet-management-system)
- [Complete Grain Design](#complete-grain-design)
- [Customizable CSS Architecture](#customizable-css-architecture)
- [API Service Exposure](#api-service-exposure)
- [Real-Time Features](#real-time-features)
- [Security & Fraud Detection](#security--fraud-detection)
- [Deployment Guide](#deployment-guide)
- [Implementation Roadmap](#implementation-roadmap)

---

## 🎯 Project Overview

### What We're Building

**Goaname** is a white-label prediction market platform where users bet on binary outcomes (Yes/No) with real-time odds, volume tracking, and trader analytics. The platform supports multiple tenants (clients) with complete brand customization.

### Key Features

| Feature | Description |
|---------|-------------|
| **Market Cards** | Display question, category, odds, volume, traders |
| **Odds Display** | Yes/No with multipliers (e.g., 1.18x, 2.29x) |
| **Volume Tracking** | Total bets in KES/USD/etc. |
| **Trader Count** | Number of unique participants |
| **Real-Time Updates** | Live odds and volume changes via SignalR |
| **Multi-Tenant** | White-label for multiple clients |
| **Wallet System** | Deposit, withdraw, transaction history |
| **Customizable CSS** | Full brand customization per tenant without recompiling |

### Why Orleans?

| Challenge | Orleans Solution |
|-----------|------------------|
| Thousands of simultaneous bets | Single-threaded Grains prevent race conditions |
| Real-time odds updates | Grain Observers push updates to clients |
| User balances & state | Stateful Grains with automatic persistence |
| Multi-grain transactions | Orleans Transactions with ACID guarantees |
| Scaling to millions | Orleans cluster distributes Grains across servers |
| Multi-tenant isolation | Tenant ID prefixes in grain keys |

---

## 📊 Core Business Logic

### 1. Automated Market Maker (AMM) - LMSR Formula

The odds are calculated automatically using the Logarithmic Market Scoring Rule (LMSR).

**Formula:**
`p_i = e^(q_i/b) / Σ e^(q_j/b)`

**Where:**
- `p_i` = Probability of outcome i
- `q_i` = Total amount bet on outcome i
- `b` = Liquidity parameter (controls sensitivity)
- `e` = Euler's number

**Odds Calculation:**
`Odds = 1 / p_i`

**Sensitivity Parameter `b`:**
- Low `b` (e.g., 100): Odds change quickly with small bets
- High `b` (e.g., 10,000): Odds change slowly, stable prices

### 2. Market State Machine

```text
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│  Draft  │──▶│  Open   │──▶│ Closing │──▶│Resolved │──▶│ Settled │
└─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘
     │             │             │             │             │
  Created      Accepting      No more       Outcome       Payouts
  by Admin       Bets          bets       Determined     Completed
```

### 3. Bet Placement Workflow (ACID Transaction)

1. User selects market, outcome (Yes/No), and amount.
2. `UserGrain` validates balance.
3. `MarketGrain` calculates new odds using AMM.
4. **Orleans Transaction Begins:**
   - `UserGrain` debits balance.
   - `MarketGrain` updates volume and odds.
   - `BetSlipGrain` creates immutable bet slip.
   - `TransactionGrain` records audit log.
5. **Transaction Commits.**
6. System sends real-time updates to all subscribers via SignalR.

---

## 📖 Detailed Use Cases

### Use Case 1: Tenant Admin Customizing the Platform
**Actor:** Tenant Administrator (e.g., a sports betting brand)
**Goal:** Launch a branded prediction market without code changes.
**Flow:**
1. Admin logs into the Tenant Dashboard.
2. Navigates to the "Theme Editor" and updates primary colors, fonts, and logo.
3. The system updates the `TenantGrain` state.
4. The frontend dynamically fetches the new CSS variables (`--gn-color-primary`, etc.) and applies them instantly without a page reload.
5. Admin configures the platform fee (e.g., 2.5%) which is immediately applied to all new bets via the AMM.

### Use Case 2: User Placing a Bet (High Concurrency)
**Actor:** End User (Bettor)
**Goal:** Place a $50 bet on "Yes" for an active market.
**Flow:**
1. User views the market; real-time odds are streamed via SignalR.
2. User enters $50 on "Yes" and clicks "Place Bet".
3. The API routes the request to the Orleans `MarketGrain`.
4. An Orleans **ACID Transaction** begins:
   - `UserGrain` verifies the $50 balance and debits it.
   - `MarketGrain` applies the LMSR formula to calculate the exact shares received and updates the new odds.
   - `BetSlipGrain` is created immutably.
5. Transaction commits. If the user had insufficient funds, the entire operation rolls back safely.
6. `MarketGrain` publishes an event; all connected clients see the odds shift instantly.

### Use Case 3: Market Resolution & Automated Settlement
**Actor:** System Admin or Automated Oracle
**Goal:** Resolve a finished market and distribute payouts.
**Flow:**
1. Oracle determines "Yes" is the winning outcome and calls the API.
2. `MarketGrain` state transitions to `Resolved`. Betting is locked.
3. `MarketGrain` delegates to `SettlementGrain` to process payouts.
4. `SettlementGrain` fetches all bet slips and processes them in batches to prevent timeouts.
5. Winning `UserGrains` are credited via transactional operations.
6. `MarketGrain` transitions to `Settled`.
7. Users receive real-time push notifications of their winnings via SignalR.

### Use Case 4: Fraud Detection & Risk Mitigation
**Actor:** System (Background Process)
**Goal:** Prevent malicious actors from manipulating the AMM or exploiting the platform.
**Flow:**
1. A user attempts to place 50 bets in 10 seconds to manipulate the LMSR curve.
2. The `FraudDetectionGrain` (listening to the bet stream) detects the velocity anomaly.
3. It immediately calls `UserGrain.FreezeAccountAsync()`.
4. The user's subsequent bets are rejected automatically.
5. An alert is flagged in the Admin Dashboard for manual review.

---

## 🏢 Orleans Multi-Tenant Architecture

### Tenant Isolation Strategy

**Grain Key Naming Convention:**
`{tenantId}_{entityType}_{entityId}`
*(e.g., `tenant1_market_omanyala_race`, `tenant1_user_123e4567`)*

**Tenant Configuration:**

| Setting | Description | Example |
|---------|-------------|---------|
| **Currency** | Betting currency | KES, USD, EUR |
| **Platform Fee** | % of each bet | 2.5% |
| **Theme** | CSS theme reference | "sports_dark" |

---

## 💳 Wallet Management System

### Wallet State

```csharp
public class WalletState
{
    // Identity
    public Guid UserId { get; set; }
    public string TenantId { get; set; }
    public string Currency { get; set; } 
    
    // Balances
    public decimal Balance { get; set; }
    public decimal TotalDeposited { get; set; }
    public decimal TotalWithdrawn { get; set; }
    public decimal TotalWon { get; set; }
    public decimal TotalLost { get; set; }
    
    // Status
    public WalletStatus Status { get; set; } // Active, Frozen, Closed
    public DateTime LastUpdated { get; set; }
    
    // Responsible Gaming Limits
    public decimal DailyLimit { get; set; }
    public decimal UsedDaily { get; set; }
    public DateTime LimitResetDate { get; set; }
}
```

---

## 🏗️ Complete Grain Design

### 1. MarketGrain
- **State:** Metadata, Lifecycle Status, AMM State (Volumes, Probabilities), Trader Tracking (HyperLogLog).
- **Methods:** `CreateMarketAsync`, `PlaceBetAsync`, `ResolveMarketAsync`, `GetCurrentOddsAsync`.
- **Concurrency:** Single-threaded execution guarantees no race conditions. `[Reentrant]` used for read-only operations.

### 2. UserGrain
- **State:** Profile, WalletState, KYC Status, Betting Stats.
- **Methods:** `DepositAsync`, `WithdrawAsync`, `PlaceBetAsync`, `SettleBetAsync`.

### 3. BetSlipGrain
- **State:** UserId, MarketId, Amount, Selected Outcome, Odds at Placement, Status (Pending/Won/Lost).
- **Methods:** `CreateBetSlipAsync`, `SettleBetSlipAsync`.

### 4. SettlementGrain
- **State:** Batch processing state, Total payout amount, Error details.
- **Logic:** Processes settlements in batches. Uses transaction compensation for failed settlements to ensure idempotency.

---

## 🎨 Customizable CSS Architecture

Goaname features an Enterprise-Grade CSS Variable-Based Theming system allowing tenants to change UI without backend deployments.

### 1. CSS Variable System
Over 150+ variables covering all design tokens:
```css
:root {
  /* Colors */
  --gn-color-primary: #3b82f6;
  --gn-color-bg-base: #0f172a;
  --gn-color-bg-surface: #1e293b;
  
  /* Odds Specific */
  --gn-color-odds-yes: #10b981;
  --gn-color-odds-no: #ef4444;
  
  /* Typography */
  --gn-font-family-base: 'Inter', sans-serif;
  --gn-radius-card: 12px;
}
```

### 2. Theme Management
- **Storage:** Themes stored in DB as JSON, cached in Redis.
- **Inheritance:** Global Default → Tenant Theme → Component Overrides.
- **Delivery:** Critical CSS inline, non-critical lazy-loaded. Hot-reloading supported for admin theme editors.

---

## 🔌 API Service Exposure

RESTful endpoints acting as gateways to the Orleans cluster:

```http
GET    /api/v1/markets                    # List all markets
GET    /api/v1/markets/{id}/odds          # Get current odds
POST   /api/v1/markets/{id}/bet           # Place bet (Auth required)
GET    /api/v1/users/{id}/balance         # Get user wallet balance
POST   /api/v1/users/{id}/deposit         # Deposit funds
GET    /api/v1/tenants/{id}/config        # Get tenant theme/config
POST   /api/v1/admin/markets/{id}/resolve # Resolve market (Admin only)
```

---

## ⚡ Real-Time Features

- **Grain Observers:** Used for server-to-server push notifications.
- **SignalR Hub:** Bridges Orleans to the web/mobile clients.
- **Events Streamed:** 
  - Odds updates (pushed immediately after AMM recalculation)
  - Volume changes
  - Market status changes (Open -> Closed)
  - Personal bet settlement notifications

---

## 🛡️ Security & Fraud Detection

- **Arbitrage Detection:** Monitors for risk-free betting patterns across accounts.
- **Sybil Detection:** Identifies multiple accounts operated by the same user (IP analysis, velocity checks).
- **Rate Limiting:** Implemented at the API Gateway and Tenant level.
- **ACID Compliance:** Orleans Transactions ensure no funds are created or destroyed during concurrent bet placements or network failures.

---

## 🚀 Deployment Guide

1. **Silos (Compute):** Deploy Orleans Silos to Kubernetes or Azure Container Apps.
2. **Clustering & Caching:** Redis for Grain Directory, distributed coordination, and Theme caching.
3. **State Persistence:** PostgreSQL for relational grain state (Wallets, Markets).
4. **Event Sourcing:** Append-only logs for transaction history.

---

## 🗺️ Implementation Roadmap

- **Phase 1: Core Engine** - Basic Grains (User, Market, BetSlip), PostgreSQL persistence.
- **Phase 2: AMM & Transactions** - LMSR implementation, Orleans ACID transactions for betting.
- **Phase 3: Multi-Tenant & Frontend** - Tenant isolation, CSS Variable architecture, Theme Editor.
- **Phase 4: Real-Time & Scale** - SignalR integration, Redis clustering, load testing.
- **Phase 5: Risk & Production** - Fraud detection grains, settlement batching, KYC integrations.