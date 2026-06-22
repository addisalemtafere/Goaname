using Goaname.Application.Common.Abstractions;
using Goaname.Application.Features.Bets.PlaceBet;
using Goaname.Application.Transactions;
using Goaname.Contracts.Bets;
using Goaname.Contracts.Markets;

namespace Goaname.Application.Features.Bets;

internal static class BetHistoryMappings
{
    public static BetHistoryItemDto ToDto(BetHistoryEntry entry) =>
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
            PlacedAt = entry.PlacedAt,
        };

    public static BetHistoryRecord FromPlaceBet(
        PlaceBetCommand command,
        PlaceBetTransactionResult result,
        MarketDto market,
        DateTimeOffset placedAt) =>
        new(
            result.BetSlipId,
            command.TenantId,
            command.UserId,
            command.MarketId,
            market.Title,
            market.Category,
            command.Amount,
            command.Outcome,
            result.SharesReceived,
            result.OddsAtPlacement,
            placedAt);
}
