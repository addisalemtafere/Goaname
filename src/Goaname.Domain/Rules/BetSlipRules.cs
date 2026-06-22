using Goaname.Domain.Enums;
using Goaname.Domain.State;

namespace Goaname.Domain.Rules;

/// <summary>
/// Pure bet slip business rules. Grains enforce outcomes via exceptions.
/// </summary>
public static class BetSlipRules
{
    public static bool IsCreated(BetSlipState state)
    {
        ArgumentNullException.ThrowIfNull(state);
        return state.Id != Guid.Empty;
    }

    public static bool MatchesCreation(
        BetSlipState existing,
        string tenantId,
        Guid userId,
        Guid marketId,
        Outcome outcome,
        decimal amount,
        decimal oddsAtPlacement,
        decimal sharesReceived)
    {
        ArgumentNullException.ThrowIfNull(existing);
        ArgumentException.ThrowIfNullOrWhiteSpace(tenantId);

        return string.Equals(existing.TenantId, tenantId, StringComparison.Ordinal)
            && existing.UserId == userId
            && existing.MarketId == marketId
            && existing.SelectedOutcome == outcome
            && existing.Amount == amount
            && existing.OddsAtPlacement == oddsAtPlacement
            && existing.SharesReceived == sharesReceived;
    }
}
