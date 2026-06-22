using Goaname.Contracts.Markets;
using Goaname.Domain.Enums;
using Goaname.Domain.State;

namespace Goaname.Grains.Interfaces;

[Alias("Goaname.Grains.Interfaces.IMarketGrain")]
public interface IMarketGrain : IGrainWithStringKey
{
    [Alias("GetStateAsync")]
    public Task<MarketState> GetStateAsync();

    [Alias("CreateAsync")]
    public Task CreateAsync(
        string tenantId,
        string title,
        string category,
        DateTimeOffset tradingEndsAt,
        decimal? liquidityParameter);

    [Alias("PublishAsync")]
    public Task PublishAsync();

    [Alias("GetOddsAsync")]
    public Task<OddsSnapshot> GetOddsAsync();

    [Alias("GetSnapshotAsync")]
    public Task<MarketGrainSnapshot> GetSnapshotAsync();

    /// <summary>
    /// Validates access rules, updates AMM volumes, and returns placement pricing.
    /// </summary>
    [Alias("PlaceBetAsync")]
    public Task<PlaceBetResult> PlaceBetAsync(Guid userId, Outcome outcome, decimal amount);
}
