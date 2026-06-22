using Goaname.Domain.State;
using Goaname.Grains.Interfaces;
using Orleans;
using Orleans.Runtime;

namespace Goaname.Grains;

public class TenantGrain : Grain, ITenantGrain
{
    private readonly IPersistentState<TenantState> _state;

    public TenantGrain(
        [PersistentState(stateName: "tenant", storageName: "GoanameStore")]
        IPersistentState<TenantState> state)
    {
        _state = state;
    }

    public Task<TenantState> GetStateAsync()
    {
        // Orleans automatically loads the state from the database 
        // before the first method call on this grain.
        return Task.FromResult(_state.State);
    }

    public async Task InitializeAsync(string name, string currency)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        ArgumentException.ThrowIfNullOrWhiteSpace(currency);

        // Only initialize if it hasn't been initialized yet
        if (string.IsNullOrEmpty(_state.State.TenantId))
        {
            // Extract tenantId from the grain key (e.g., "mulasport_tenant" -> "mulasport")
            _state.State.TenantId = this.GetPrimaryKeyString().Split('_')[0]; 
            _state.State.Name = name;
            _state.State.Currency = currency;
            _state.State.LastUpdatedAt = DateTimeOffset.UtcNow;

            // Save the changes to the database
            await _state.WriteStateAsync().ConfigureAwait(true);
        }
    }

    public async Task UpdateBettingEnabledAsync(bool enabled)
    {
        _state.State.BettingEnabled = enabled;
        _state.State.LastUpdatedAt = DateTimeOffset.UtcNow;
        
        // Save the changes to the database
        await _state.WriteStateAsync().ConfigureAwait(true);
    }
}
