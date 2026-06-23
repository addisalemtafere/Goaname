using Goaname.Application.Common.Abstractions;
using Goaname.Application.Common.Mappings;
using Goaname.Contracts.Markets;
using Goaname.Domain.Rules;

namespace Goaname.Application.Features.Markets;

internal static class MarketBetMappings
{
    public static MarketBetsDto ToDto(IReadOnlyList<BetHistoryEntry> entries)
    {
        var aggregates = entries.Select(BetHistoryEntryMapper.ToAggregate).ToList();
        var summary = BetHistorySummaryRules.Summarize(aggregates);

        return new MarketBetsDto
        {
            Summary = ToSummaryDto(summary),
            Bets = entries.Select(BetHistoryEntryMapper.ToMarketBetItemDto).ToList(),
        };
    }

    private static MarketBetSummaryDto ToSummaryDto(BetHistorySummary summary) =>
        new()
        {
            TotalBets = summary.TotalBets,
            UniqueTraders = summary.UniqueTraders,
            TotalStaked = summary.TotalStaked,
            YesBets = summary.YesBets,
            NoBets = summary.NoBets,
            YesStaked = summary.YesStaked,
            NoStaked = summary.NoStaked,
            PendingBets = summary.PendingBets,
            WonBets = summary.WonBets,
            LostBets = summary.LostBets,
            TotalPaidOut = summary.TotalPaidOut,
        };
}
