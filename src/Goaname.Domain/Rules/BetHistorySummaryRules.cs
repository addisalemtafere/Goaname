using Goaname.Domain.Enums;

namespace Goaname.Domain.Rules;

public sealed record BetAggregate(
    Guid UserId,
    Outcome SelectedOutcome,
    decimal Amount,
    BetStatus Status,
    decimal? SettlementAmount);

public sealed record BetHistorySummary(
    int TotalBets,
    int UniqueTraders,
    decimal TotalStaked,
    int YesBets,
    int NoBets,
    decimal YesStaked,
    decimal NoStaked,
    int PendingBets,
    int WonBets,
    int LostBets,
    decimal TotalPaidOut);

public static class BetHistorySummaryRules
{
    public static BetHistorySummary Summarize(IReadOnlyList<BetAggregate> bets)
    {
        ArgumentNullException.ThrowIfNull(bets);

        if (bets.Count == 0)
        {
            return new BetHistorySummary(0, 0, 0m, 0, 0, 0m, 0m, 0, 0, 0, 0m);
        }

        var yesBets = bets.Where(b => b.SelectedOutcome == Outcome.Yes).ToList();
        var noBets = bets.Where(b => b.SelectedOutcome == Outcome.No).ToList();

        return new BetHistorySummary(
            TotalBets: bets.Count,
            UniqueTraders: bets.Select(b => b.UserId).Distinct().Count(),
            TotalStaked: bets.Sum(b => b.Amount),
            YesBets: yesBets.Count,
            NoBets: noBets.Count,
            YesStaked: yesBets.Sum(b => b.Amount),
            NoStaked: noBets.Sum(b => b.Amount),
            PendingBets: bets.Count(b => b.Status == BetStatus.Pending),
            WonBets: bets.Count(b => b.Status == BetStatus.Won),
            LostBets: bets.Count(b => b.Status == BetStatus.Lost),
            TotalPaidOut: bets
                .Where(b => b.SettlementAmount.HasValue)
                .Sum(b => b.SettlementAmount!.Value));
    }
}
