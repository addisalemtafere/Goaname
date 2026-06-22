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

    public static bool IsSettled(BetSlipState state)
    {
        ArgumentNullException.ThrowIfNull(state);
        return state.Status is BetStatus.Won or BetStatus.Lost or BetStatus.Cancelled or BetStatus.Refunded;
    }

    public static bool IsMatchingSettlement(BetSlipState state, BetStatus status, decimal settlementAmount)
    {
        ArgumentNullException.ThrowIfNull(state);
        return state.Status == status
            && state.SettlementAmount == settlementAmount
            && state.SettledAt.HasValue;
    }
}
