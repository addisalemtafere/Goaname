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

    /// <summary>
    /// Marks the bet slip won or lost. Idempotent when called again with the same status and payout.
    /// </summary>
    [Alias("SettleAsync")]
    public Task SettleAsync(BetStatus status, decimal settlementAmount);
}
