using Goaname.Application.Common.Abstractions;
using Goaname.Application.Common.Mappings;
using Goaname.Application.Features.Bets.PlaceBet;
using Goaname.Application.Transactions;
using Goaname.Contracts.Bets;
using Goaname.Contracts.Markets;

namespace Goaname.Application.Features.Bets;

internal static class BetHistoryMappings
{
    public static BetHistoryItemDto ToDto(BetHistoryEntry entry) =>
        BetHistoryEntryMapper.ToBetHistoryItemDto(entry);

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
