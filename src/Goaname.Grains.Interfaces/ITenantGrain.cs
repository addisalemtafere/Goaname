using Goaname.Domain.State;

namespace Goaname.Grains.Interfaces;

[Alias("Goaname.Grains.Interfaces.ITenantGrain")]
public interface ITenantGrain : IGrainWithStringKey
{
    [Alias("GetStateAsync")]
    public Task<TenantState> GetStateAsync();

    [Alias("InitializeAsync")]
    public Task InitializeAsync(string name, string currency);

    [Alias("UpdateBettingEnabledAsync")]
    public Task UpdateBettingEnabledAsync(bool enabled);
}
