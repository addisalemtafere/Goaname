using Goaname.Application.Common.Abstractions;
using Goaname.Contracts.Activity;
using Goaname.Domain.Enums;

namespace Goaname.Application.Features.Activity;

internal static class ActivityMappings
{
    public static ActivityFeedItemDto ToFeedItem(BetHistoryEntry entry) =>
        new()
        {
            Id = entry.BetSlipId,
            PlacedAt = entry.PlacedAt,
            TraderLabel = FormatTraderLabel(entry.UserId),
            Kind = entry.SelectedOutcome == Outcome.Yes ? ActivityKinds.BuyYes : ActivityKinds.BuyNo,
            MarketTitle = entry.MarketTitle,
            Category = entry.Category,
            Amount = entry.Amount,
            Shares = entry.PotentialPayout,
        };

    public static string FormatTraderLabel(Guid userId)
    {
        var hex = userId.ToString("N");
        return $"0x{hex[..2]}…{hex[^2..]}";
    }
}

internal static class ActivityKinds
{
    public const string BuyYes = "buy_yes";
    public const string BuyNo = "buy_no";
}
