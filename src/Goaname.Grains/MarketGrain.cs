using Goaname.Contracts.Markets;
using Goaname.Domain.Constants;
using Goaname.Domain.Enums;
using Goaname.Domain.Exceptions;
using Goaname.Domain.Math;
using Goaname.Domain.Rules;
using Goaname.Domain.State;
using Goaname.Grains.Interfaces;
using Orleans.Runtime;

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
        if (!string.Equals(keyTenantId, tenantId, StringComparison.Ordinal))
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
