using Goaname.Domain.Enums;

namespace Goaname.Domain.Rules;

public sealed record BetSettlementOutcome(BetStatus Status, decimal Payout);

public static class BetSettlementRules
{
    public static bool DidWin(Outcome selectedOutcome, Outcome winningOutcome) =>
        selectedOutcome == winningOutcome;

    public static BetStatus ResolveStatus(bool won) => won ? BetStatus.Won : BetStatus.Lost;

    public static decimal CalculatePayout(bool won, decimal sharesReceived) =>
        won ? sharesReceived : 0m;

    public static BetSettlementOutcome Resolve(
        Outcome selectedOutcome,
        Outcome winningOutcome,
        decimal sharesReceived)
    {
        var won = DidWin(selectedOutcome, winningOutcome);
        return new(ResolveStatus(won), CalculatePayout(won, sharesReceived));
    }
}
