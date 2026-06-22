using Goaname.Application.Common.Abstractions;
using Goaname.Contracts.Bets;
using Goaname.Contracts.Markets;
using Goaname.Domain.Rules;

namespace Goaname.Application.Common.Mappings;

internal static class BetHistoryEntryMapper
{
    public static BetHistoryItemDto ToBetHistoryItemDto(BetHistoryEntry entry) =>
        new()
        {
            BetSlipId = entry.BetSlipId,
            MarketId = entry.MarketId,
            MarketTitle = entry.MarketTitle,
            Category = entry.Category,
            Outcome = entry.SelectedOutcome,
            Amount = entry.Amount,
            SharesReceived = entry.PotentialPayout,
            OddsAtPlacement = entry.OddsAtPlacement,
            Status = entry.Status,
            SettlementAmount = entry.SettlementAmount,
            PlacedAt = entry.PlacedAt,
            SettledAt = entry.SettledAt,
        };

    public static MarketBetItemDto ToMarketBetItemDto(BetHistoryEntry entry) =>
        new()
        {
            BetSlipId = entry.BetSlipId,
            UserId = entry.UserId,
            Outcome = entry.SelectedOutcome,
            Amount = entry.Amount,
            SharesReceived = entry.PotentialPayout,
            OddsAtPlacement = entry.OddsAtPlacement,
            Status = entry.Status,
            SettlementAmount = entry.SettlementAmount,
            PlacedAt = entry.PlacedAt,
            SettledAt = entry.SettledAt,
        };

    public static BetAggregate ToAggregate(BetHistoryEntry entry) =>
        new(
            entry.UserId,
            entry.SelectedOutcome,
            entry.Amount,
            entry.Status,
            entry.SettlementAmount);
}
