using Goaname.Domain.Exceptions;
using Goaname.Domain.State;
using Goaname.Grains.Interfaces;
using Orleans.Runtime;

namespace Goaname.Grains;

public class TenantCatalogGrain : Grain, ITenantCatalogGrain
{
    private readonly IPersistentState<TenantCatalogState> _state;

    public TenantCatalogGrain(
        [PersistentState(stateName: "tenantcatalog", storageName: "GoanameStore")]
        IPersistentState<TenantCatalogState> state)
    {
        _state = state;
    }

    public async Task RegisterAsync(string tenantId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(tenantId);

        var normalized = tenantId.Trim();
        if (_state.State.TenantIds.Any(existing => string.Equals(existing, normalized, StringComparison.OrdinalIgnoreCase)))
        {
            return;
        }

        _state.State.TenantIds.Add(normalized);
        await _state.WriteStateAsync().ConfigureAwait(true);
    }

    public Task<IReadOnlyList<string>> GetTenantIdsAsync() =>
        Task.FromResult<IReadOnlyList<string>>([.. _state.State.TenantIds.OrderBy(static id => id, StringComparer.OrdinalIgnoreCase)]);
}
