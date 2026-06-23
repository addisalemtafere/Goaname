using Goaname.Domain.Exceptions;
using Goaname.Domain.State;
using Goaname.Grains.Interfaces;
using Orleans.Runtime;

namespace Goaname.Grains;

public class MarketCatalogGrain : Grain, IMarketCatalogGrain
{
    private readonly IPersistentState<MarketCatalogState> _state;

    public MarketCatalogGrain(
        [PersistentState(stateName: "marketcatalog", storageName: "GoanameStore")]
        IPersistentState<MarketCatalogState> state)
    {
        _state = state;
    }

    public async Task RegisterAsync(Guid marketId)
    {
        if (marketId == Guid.Empty)
        {
            throw new BusinessRuleException("Market id is required.");
        }

        var changed = false;

        if (!_state.State.PublishedMarketIds.Contains(marketId))
        {
            _state.State.PublishedMarketIds.Add(marketId);
            changed = true;
        }

        if (!_state.State.AllMarketIds.Contains(marketId))
        {
            _state.State.AllMarketIds.Add(marketId);
            changed = true;
        }

        if (changed)
        {
            await _state.WriteStateAsync().ConfigureAwait(true);
        }
    }

    public async Task RegisterCreatedAsync(Guid marketId)
    {
        if (marketId == Guid.Empty)
        {
            throw new BusinessRuleException("Market id is required.");
        }

        if (!_state.State.AllMarketIds.Contains(marketId))
        {
            _state.State.AllMarketIds.Add(marketId);
            await _state.WriteStateAsync().ConfigureAwait(true);
        }
    }

    public Task<IReadOnlyList<Guid>> GetPublishedMarketIdsAsync() =>
        Task.FromResult<IReadOnlyList<Guid>>([.. _state.State.PublishedMarketIds]);

    public Task<IReadOnlyList<Guid>> GetAllMarketIdsAsync()
    {
        var marketIds = new HashSet<Guid>(_state.State.AllMarketIds);

        foreach (var publishedMarketId in _state.State.PublishedMarketIds)
        {
            marketIds.Add(publishedMarketId);
        }

        return Task.FromResult<IReadOnlyList<Guid>>([.. marketIds]);
    }
}
