using Goaname.Application.Common.Mappings;
using Goaname.Contracts.Leaderboard;
using Goaname.Domain.Rules;

namespace Goaname.Application.Features.Leaderboard;

internal static class LeaderboardMappings
{
    public static LeaderboardDto ToDto(
        LeaderboardResult result,
        IReadOnlyDictionary<Guid, string> displayNames) =>
        new()
        {
            Stats = ToStatsDto(result.Summary),
            Entries = result.RankedTraders
                .Select((metrics, index) => ToEntryDto(metrics, index + 1, displayNames))
                .ToList(),
        };

    private static LeaderboardStatsDto ToStatsDto(LeaderboardSummary summary) =>
        new()
        {
            ActiveTraders = summary.ActiveTraders,
            WeeklyVolume = summary.WeeklyVolume,
            TopWinRate = summary.TopWinRate,
        };

    private static LeaderboardEntryDto ToEntryDto(
        TraderLeaderboardMetrics metrics,
        int rank,
        IReadOnlyDictionary<Guid, string> displayNames) =>
        new()
        {
            Rank = rank,
            UserId = metrics.UserId,
            DisplayName = displayNames.GetValueOrDefault(
                metrics.UserId,
                UserLabelFormatting.FormatTraderLabel(metrics.UserId)),
            Pnl = metrics.Pnl,
            WinRate = metrics.WinRatePercent,
            Volume = metrics.Volume,
            Trades = metrics.Trades,
        };
}
