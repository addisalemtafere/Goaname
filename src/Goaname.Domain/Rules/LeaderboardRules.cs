using Goaname.Domain.Enums;

namespace Goaname.Domain.Rules;

public sealed record TraderBetSnapshot(
    Guid UserId,
    decimal Amount,
    BetStatus Status,
    decimal? SettlementAmount,
    DateTimeOffset PlacedAt);

public sealed record TraderLeaderboardMetrics(
    Guid UserId,
    decimal Pnl,
    int Trades,
    int WonBets,
    int SettledBets,
    decimal Volume)
{
    public int WinRatePercent => LeaderboardRules.CalculateWinRatePercent(WonBets, SettledBets);
}

public sealed record LeaderboardSummary(
    int ActiveTraders,
    decimal WeeklyVolume,
    int TopWinRate);

public sealed record LeaderboardResult(
    LeaderboardSummary Summary,
    IReadOnlyList<TraderLeaderboardMetrics> RankedTraders);

public static class LeaderboardRules
{
    public const int MinimumSettledBetsForWinRate = 3;
    private const int WeeklyWindowDays = 7;

    public static decimal CalculateBetPnl(decimal amount, BetStatus status, decimal? settlementAmount) =>
        status switch
        {
            BetStatus.Won => (settlementAmount ?? 0m) - amount,
            BetStatus.Lost => -amount,
            _ => 0m,
        };

    public static int CalculateWinRatePercent(int wonBets, int settledBets) =>
        settledBets == 0 ? 0 : (int)System.Math.Round(wonBets * 100m / settledBets, MidpointRounding.AwayFromZero);

    public static LeaderboardResult Build(
        IReadOnlyList<TraderBetSnapshot> bets,
        int limit,
        DateTimeOffset utcNow)
    {
        ArgumentNullException.ThrowIfNull(bets);

        var rankedTraders = RankByPnl(bets, limit);
        return new(Summarize(bets, rankedTraders, utcNow), rankedTraders);
    }

    private static List<TraderLeaderboardMetrics> RankByPnl(
        IReadOnlyList<TraderBetSnapshot> bets,
        int limit) =>
        bets
            .GroupBy(bet => bet.UserId)
            .Select(AggregateTraderMetrics)
            .OrderByDescending(metrics => metrics.Pnl)
            .ThenByDescending(metrics => metrics.Volume)
            .ThenBy(metrics => metrics.UserId)
            .Take(limit)
            .ToList();

    private static TraderLeaderboardMetrics AggregateTraderMetrics(IGrouping<Guid, TraderBetSnapshot> group)
    {
        var wonBets = group.Count(bet => bet.Status == BetStatus.Won);
        var settledBets = wonBets + group.Count(bet => bet.Status == BetStatus.Lost);

        return new TraderLeaderboardMetrics(
            group.Key,
            group.Sum(bet => CalculateBetPnl(bet.Amount, bet.Status, bet.SettlementAmount)),
            group.Count(),
            wonBets,
            settledBets,
            group.Sum(bet => bet.Amount));
    }

    private static LeaderboardSummary Summarize(
        IReadOnlyList<TraderBetSnapshot> bets,
        IReadOnlyList<TraderLeaderboardMetrics> rankedTraders,
        DateTimeOffset utcNow)
    {
        var weekAgo = utcNow.AddDays(-WeeklyWindowDays);
        var recentBets = bets.Where(bet => bet.PlacedAt >= weekAgo).ToList();

        return new LeaderboardSummary(
            ActiveTraders: recentBets.Select(bet => bet.UserId).Distinct().Count(),
            WeeklyVolume: recentBets.Sum(bet => bet.Amount),
            TopWinRate: rankedTraders
                .Where(metrics => metrics.SettledBets >= MinimumSettledBetsForWinRate)
                .Select(metrics => metrics.WinRatePercent)
                .DefaultIfEmpty(0)
                .Max());
    }
}
