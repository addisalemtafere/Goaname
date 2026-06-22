using Goaname.Application.Features.Markets.CreateMarket;
using Goaname.Contracts.Markets;
using Goaname.Domain.Enums;
using Goaname.Domain.Exceptions;
using Goaname.Domain.Rules;
using Goaname.Domain.State;
using Goaname.Grains.Interfaces;

namespace Goaname.Application.Features.Markets;

public sealed class MarketGrainAccessor(IGrainFactory grainFactory) : IMarketGrainAccessor
{
    public async Task<MarketDto> GetMarketAsync(
        string tenantId,
        Guid marketId,
        CancellationToken cancellationToken = default)
    {
        var snapshot = await GetSnapshotAsync(tenantId, marketId, cancellationToken).ConfigureAwait(false);
        return MarketDtoMapper.MapToDto(snapshot);
    }

    public Task<OddsSnapshot> GetOddsAsync(
        string tenantId,
        Guid marketId,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        return GetMarketGrain(tenantId, marketId).GetOddsAsync();
    }

    public async Task<MarketDto> CreateMarketAsync(
        CreateMarketCommand command,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(command);

        var tenantState = await RequireTenantAsync(command.TenantId, cancellationToken).ConfigureAwait(false);
        EnsureCategoryAllowed(tenantState, command.Category);

        var marketId = Guid.NewGuid();
        var grain = GetMarketGrain(command.TenantId, marketId);

        await grain.CreateAsync(
            command.TenantId,
            command.Title,
            command.Category,
            command.TradingEndsAt,
            command.LiquidityParameter).ConfigureAwait(false);

        await GetCatalogGrain(command.TenantId).RegisterCreatedAsync(marketId).ConfigureAwait(false);

        return await ToDtoAsync(grain, cancellationToken).ConfigureAwait(false);
    }

    public async Task<MarketDto> PublishMarketAsync(
        string tenantId,
        Guid marketId,
        CancellationToken cancellationToken = default)
    {
        var grain = GetMarketGrain(tenantId, marketId);
        await grain.PublishAsync().ConfigureAwait(false);
        return await ToDtoAsync(grain, cancellationToken).ConfigureAwait(false);
    }

    public async Task<MarketDto> CloseMarketAsync(
        string tenantId,
        Guid marketId,
        CancellationToken cancellationToken = default)
    {
        var grain = GetMarketGrain(tenantId, marketId);
        await grain.CloseTradingAsync().ConfigureAwait(false);
        return await ToDtoAsync(grain, cancellationToken).ConfigureAwait(false);
    }

    public async Task<MarketDto> ResolveMarketAsync(
        string tenantId,
        Guid marketId,
        Outcome winningOutcome,
        CancellationToken cancellationToken = default)
    {
        var grain = GetMarketGrain(tenantId, marketId);
        await grain.ResolveAsync(winningOutcome).ConfigureAwait(false);
        return await ToDtoAsync(grain, cancellationToken).ConfigureAwait(false);
    }

    public async Task<MarketDto> SettleMarketAsync(
        string tenantId,
        Guid marketId,
        CancellationToken cancellationToken = default)
    {
        var grain = GetMarketGrain(tenantId, marketId);
        await grain.MarkSettledAsync().ConfigureAwait(false);
        return await ToDtoAsync(grain, cancellationToken).ConfigureAwait(false);
    }

    public async Task<IReadOnlyList<MarketDto>> ListVisibleMarketsAsync(
        string tenantId,
        CancellationToken cancellationToken = default)
    {
        var marketIds = await GetCatalogGrain(tenantId).GetPublishedMarketIdsAsync().ConfigureAwait(false);

        if (marketIds.Count == 0)
        {
            return [];
        }

        var results = await Task.WhenAll(
            marketIds.Select(id => TryGetMarketAsync(
                tenantId,
                id,
                state => MarketAccessRules.IsVisibleOnSite(state),
                cancellationToken)))
            .ConfigureAwait(false);

        return [.. results.Where(market => market is not null).Select(market => market!)];
    }

    public async Task<IReadOnlyList<MarketDto>> ListAdminMarketsAsync(
        string tenantId,
        CancellationToken cancellationToken = default)
    {
        var marketIds = await GetCatalogGrain(tenantId).GetAllMarketIdsAsync().ConfigureAwait(false);

        if (marketIds.Count == 0)
        {
            return [];
        }

        var results = await Task.WhenAll(
            marketIds.Select(id => TryGetMarketAsync(tenantId, id, include: null, cancellationToken)))
            .ConfigureAwait(false);

        return [.. results
            .Where(market => market is not null)
            .Select(market => market!)
            .OrderByDescending(market => market.TradingEndsAt)];
    }

    private async Task<MarketDto?> TryGetMarketAsync(
        string tenantId,
        Guid marketId,
        Func<MarketState, bool>? include,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        try
        {
            var snapshot = await GetMarketGrain(tenantId, marketId).GetSnapshotAsync().ConfigureAwait(false);
            return include is null || include(snapshot.State)
                ? MarketDtoMapper.MapToDto(snapshot)
                : null;
        }
        catch (NotFoundException)
        {
            return null;
        }
    }

    private async Task<MarketGrainSnapshot> GetSnapshotAsync(
        string tenantId,
        Guid marketId,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        return await GetMarketGrain(tenantId, marketId).GetSnapshotAsync().ConfigureAwait(false);
    }

    private static async Task<MarketDto> ToDtoAsync(IMarketGrain grain, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var snapshot = await grain.GetSnapshotAsync().ConfigureAwait(false);
        return MarketDtoMapper.MapToDto(snapshot);
    }

    private async Task<TenantState> RequireTenantAsync(string tenantId, CancellationToken cancellationToken)
    {
        var tenantState = await GetTenantStateAsync(tenantId, cancellationToken).ConfigureAwait(false);

        if (string.IsNullOrWhiteSpace(tenantState.TenantId))
        {
            throw new NotFoundException("Tenant", tenantId);
        }

        return tenantState;
    }

    private static void EnsureCategoryAllowed(TenantState tenantState, string category)
    {
        if (!MarketAccessRules.IsCategoryAllowed(tenantState, category))
        {
            throw new BusinessRuleException($"Category '{category}' is not enabled for this tenant.");
        }
    }

    private Task<TenantState> GetTenantStateAsync(string tenantId, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        return grainFactory.GetGrain<ITenantGrain>(GrainKeys.Tenant(tenantId)).GetStateAsync();
    }

    private IMarketGrain GetMarketGrain(string tenantId, Guid marketId) =>
        grainFactory.GetGrain<IMarketGrain>(GrainKeys.Market(tenantId, marketId));

    private IMarketCatalogGrain GetCatalogGrain(string tenantId) =>
        grainFactory.GetGrain<IMarketCatalogGrain>(GrainKeys.MarketCatalog(tenantId));
}
