using Goaname.Contracts.Markets;
using Goaname.Domain.Constants;
using Goaname.Domain.Enums;
using Goaname.Domain.Exceptions;
using Goaname.Domain.Math;
using Goaname.Domain.Rules;
using Goaname.Domain.State;
using Goaname.Grains.Interfaces;
using Orleans.Runtime;
using Orleans.Transactions;

namespace Goaname.Grains;

public class MarketGrain : Grain, IMarketGrain
{
    private readonly IPersistentState<MarketState> _state;

    public MarketGrain(
        [PersistentState(stateName: "market", storageName: "GoanameStore")]
        IPersistentState<MarketState> state)
    {
        _state = state;
    }

    public Task<MarketState> GetStateAsync() => Task.FromResult(_state.State);

    public async Task CreateAsync(
        string tenantId,
        string title,
        string category,
        DateTimeOffset tradingEndsAt,
        decimal? liquidityParameter)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(tenantId);
        ArgumentException.ThrowIfNullOrWhiteSpace(title);
        ArgumentException.ThrowIfNullOrWhiteSpace(category);

        EnsureTenantMatchesKey(tenantId);
        EnsureFieldLengths(title, category);

        if (!MarketLifecycleRules.IsUninitialized(_state.State))
        {
            throw new BusinessRuleException("Market already exists.");
        }

        var utcNow = DateTimeOffset.UtcNow;
        if (!MarketLifecycleRules.IsTradingWindowOpen(tradingEndsAt, utcNow))
        {
            throw new BusinessRuleException("Trading end date must be in the future.");
        }

        var marketId = GrainKeys.ParseMarketId(this.GetPrimaryKeyString());
        var liquidity = liquidityParameter ?? await GetTenantDefaultLiquidityAsync(tenantId).ConfigureAwait(true);
        var (yesProbability, noProbability) = LmsrCalculator.CalculateProbabilities(0, 0, liquidity);

        _state.State.Id = marketId;
        _state.State.TenantId = tenantId;
        _state.State.Title = title.Trim();
        _state.State.Category = category.Trim();
        _state.State.TradingEndsAt = tradingEndsAt;
        _state.State.CreatedAt = utcNow;
        _state.State.Status = MarketStatus.Draft;
        _state.State.IsVisible = false;
        _state.State.LiquidityParameter = liquidity;
        _state.State.YesVolume = 0;
        _state.State.NoVolume = 0;
        _state.State.YesProbability = yesProbability;
        _state.State.NoProbability = noProbability;

        await _state.WriteStateAsync().ConfigureAwait(true);
    }

    public async Task PublishAsync()
    {
        EnsureCreated();

        var utcNow = DateTimeOffset.UtcNow;
        var failureReason = MarketLifecycleRules.GetPublishFailureReason(_state.State, utcNow);
        if (failureReason is not null)
        {
            throw new BusinessRuleException(failureReason);
        }

        _state.State.Status = MarketStatus.Open;
        _state.State.IsVisible = true;
        await _state.WriteStateAsync().ConfigureAwait(true);

        var catalog = GrainFactory.GetGrain<IMarketCatalogGrain>(GrainKeys.MarketCatalog(_state.State.TenantId));
        await catalog.RegisterAsync(_state.State.Id).ConfigureAwait(true);
    }

    public async Task CloseTradingAsync()
    {
        EnsureCreated();

        var failureReason = MarketLifecycleRules.GetCloseTradingFailureReason(_state.State);
        if (failureReason is not null)
        {
            throw new BusinessRuleException(failureReason);
        }

        _state.State.Status = MarketStatus.Closing;
        _state.State.YesBettingEnabled = false;
        _state.State.NoBettingEnabled = false;
        await _state.WriteStateAsync().ConfigureAwait(true);
    }

    public async Task ResolveAsync(Outcome winningOutcome)
    {
        EnsureCreated();

        if (winningOutcome is not Outcome.Yes and not Outcome.No)
        {
            throw new BusinessRuleException("Winning outcome must be Yes or No.");
        }

        var failureReason = MarketLifecycleRules.GetResolveFailureReason(_state.State);
        if (failureReason is not null)
        {
            throw new BusinessRuleException(failureReason);
        }

        var utcNow = DateTimeOffset.UtcNow;
        _state.State.Status = MarketStatus.Resolved;
        _state.State.WinningOutcome = winningOutcome;
        _state.State.ResolutionAt = utcNow;
        _state.State.YesBettingEnabled = false;
        _state.State.NoBettingEnabled = false;
        await _state.WriteStateAsync().ConfigureAwait(true);
    }

    public async Task MarkSettledAsync()
    {
        EnsureCreated();

        if (_state.State.Status == MarketStatus.Settled)
        {
            return;
        }

        var failureReason = MarketLifecycleRules.GetSettleFailureReason(_state.State);
        if (failureReason is not null)
        {
            throw new BusinessRuleException(failureReason);
        }

        _state.State.Status = MarketStatus.Settled;
        _state.State.SettledAt = DateTimeOffset.UtcNow;
        await _state.WriteStateAsync().ConfigureAwait(true);
    }

    public Task<OddsSnapshot> GetOddsAsync()
    {
        EnsureCreated();
        return Task.FromResult(ToOddsSnapshot(_state.State));
    }

    public Task<MarketGrainSnapshot> GetSnapshotAsync()
    {
        EnsureCreated();
        return Task.FromResult(BuildSnapshot(_state.State));
    }

    [Transaction(TransactionOption.CreateOrJoin)]
    public async Task<PlaceBetResult> PlaceBetAsync(Guid userId, Outcome outcome, decimal amount)
    {
        EnsureCreated();

        if (userId == Guid.Empty)
        {
            throw new BusinessRuleException("User id is required.");
        }

        var utcNow = DateTimeOffset.UtcNow;
        var tenantState = await GetTenantStateAsync(_state.State.TenantId).ConfigureAwait(true);

        var failureReason = MarketBetRules.GetPlacementFailureReason(
            tenantState,
            _state.State,
            outcome,
            amount,
            utcNow);

        if (failureReason is not null)
        {
            throw new BusinessRuleException(failureReason);
        }

        var oddsAtPlacement = MarketBetRules.GetOddsMultiplier(
            _state.State.YesProbability,
            _state.State.NoProbability,
            outcome);

        var effectiveBetAmount = MarketBetRules.CalculateEffectiveBetAmount(
            amount,
            tenantState.PlatformFeePercent);

        var sharesReceived = MarketBetRules.CalculateSharesReceived(
            _state.State,
            outcome,
            effectiveBetAmount);

        MarketBetRules.ApplyVolumeDelta(_state.State, outcome, sharesReceived);
        MarketBetRules.RecordTrader(_state.State, userId);

        await _state.WriteStateAsync().ConfigureAwait(true);

        return new PlaceBetResult
        {
            Outcome = outcome,
            Amount = amount,
            OddsAtPlacement = oddsAtPlacement,
            SharesReceived = sharesReceived,
            UpdatedOdds = ToOddsSnapshot(_state.State),
        };
    }

    private static MarketGrainSnapshot BuildSnapshot(MarketState state)
    {
        var odds = ToOddsSnapshot(state);

        return new MarketGrainSnapshot
        {
            State = state,
            YesProbability = odds.YesProbability,
            NoProbability = odds.NoProbability,
            YesMultiplier = odds.YesMultiplier,
            NoMultiplier = odds.NoMultiplier,
        };
    }

    private static OddsSnapshot ToOddsSnapshot(MarketState state)
    {
        var (yesProbability, noProbability, yesMultiplier, noMultiplier) = OddsCalculator.Calculate(
            state.YesVolume,
            state.NoVolume,
            state.LiquidityParameter);

        return new OddsSnapshot(yesProbability, noProbability, yesMultiplier, noMultiplier);
    }

    private void EnsureTenantMatchesKey(string tenantId)
    {
        var keyTenantId = GrainKeys.ParseTenantIdFromMarketKey(this.GetPrimaryKeyString());
        if (!GrainKeyRules.TenantMatches(keyTenantId, tenantId))
        {
            throw new BusinessRuleException("Tenant id does not match market grain key.");
        }
    }

    private static void EnsureFieldLengths(string title, string category)
    {
        var trimmedTitle = title.Trim();
        if (trimmedTitle.Length is < MarketConstraints.TitleMinLength or > MarketConstraints.TitleMaxLength)
        {
            throw new BusinessRuleException(
                $"Title must be between {MarketConstraints.TitleMinLength} and {MarketConstraints.TitleMaxLength} characters.");
        }

        if (category.Trim().Length > MarketConstraints.CategoryMaxLength)
        {
            throw new BusinessRuleException(
                $"Category must be at most {MarketConstraints.CategoryMaxLength} characters.");
        }
    }

    private async Task<TenantState> GetTenantStateAsync(string tenantId)
    {
        var tenant = GrainFactory.GetGrain<ITenantGrain>(GrainKeys.Tenant(tenantId));
        return await tenant.GetStateAsync().ConfigureAwait(true);
    }

    private async Task<decimal> GetTenantDefaultLiquidityAsync(string tenantId)
    {
        var tenant = GrainFactory.GetGrain<ITenantGrain>(GrainKeys.Tenant(tenantId));
        var tenantState = await tenant.GetStateAsync().ConfigureAwait(true);
        return tenantState.DefaultLiquidityParameter;
    }

    private void EnsureCreated()
    {
        if (MarketLifecycleRules.IsUninitialized(_state.State))
        {
            throw new NotFoundException("Market", GrainKeys.ParseMarketId(this.GetPrimaryKeyString()));
        }
    }
}
