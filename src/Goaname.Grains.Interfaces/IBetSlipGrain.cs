using Goaname.Domain.Enums;
using Goaname.Domain.State;

namespace Goaname.Grains.Interfaces;

[Alias("Goaname.Grains.Interfaces.IBetSlipGrain")]
public interface IBetSlipGrain : IGrainWithStringKey
{
    [Alias("GetStateAsync")]
    public Task<BetSlipState> GetStateAsync();

    /// <summary>
    /// Creates an immutable bet slip. Idempotent when called again with the same grain key.
    /// </summary>
    [Alias("CreateAsync")]
    public Task CreateAsync(
        string tenantId,
        Guid userId,
        Guid marketId,
        Outcome outcome,
        decimal amount,
        decimal oddsAtPlacement,
        decimal sharesReceived);
}
