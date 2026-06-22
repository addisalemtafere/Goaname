using Goaname.Domain.Enums;
using Goaname.Domain.State;

namespace Goaname.Domain.Rules;

public static class MarketLifecycleRules
{
    public static bool IsUninitialized(MarketState market)
    {
        ArgumentNullException.ThrowIfNull(market);
        return market.Id == Guid.Empty;
    }

    public static bool IsTradingWindowOpen(MarketState market, DateTimeOffset utcNow)
    {
        ArgumentNullException.ThrowIfNull(market);
        return market.TradingEndsAt > utcNow;
    }

    public static bool IsTradingWindowOpen(DateTimeOffset tradingEndsAt, DateTimeOffset utcNow) =>
        tradingEndsAt > utcNow;

    public static bool CanPublish(MarketState market, DateTimeOffset utcNow)
    {
        ArgumentNullException.ThrowIfNull(market);
        return market.Status == MarketStatus.Draft && IsTradingWindowOpen(market, utcNow);
    }

    public static string? GetPublishFailureReason(MarketState market, DateTimeOffset utcNow)
    {
        ArgumentNullException.ThrowIfNull(market);

        if (market.Status != MarketStatus.Draft)
        {
            return "Only draft markets can be published.";
        }

        if (!IsTradingWindowOpen(market, utcNow))
        {
            return "Cannot publish: trading window has ended.";
        }

        return null;
    }

    public static string? GetCloseTradingFailureReason(MarketState market)
    {
        ArgumentNullException.ThrowIfNull(market);

        return market.Status switch
        {
            MarketStatus.Open => null,
            MarketStatus.Closing => "Market is already closed for betting.",
            MarketStatus.Resolved => "Market is already resolved.",
            MarketStatus.Settled => "Market is already settled.",
            MarketStatus.Cancelled => "Market is cancelled.",
            _ => "Only open markets can be closed for betting.",
        };
    }

    public static string? GetResolveFailureReason(MarketState market)
    {
        ArgumentNullException.ThrowIfNull(market);

        return market.Status switch
        {
            MarketStatus.Open or MarketStatus.Closing => null,
            MarketStatus.Resolved => "Market is already resolved.",
            MarketStatus.Settled => "Market is already settled.",
            MarketStatus.Cancelled => "Market is cancelled.",
            _ => "Only open or closing markets can be resolved.",
        };
    }

    public static string? GetSettleFailureReason(MarketState market)
    {
        ArgumentNullException.ThrowIfNull(market);
        return GetSettleFailureReason(market.Status, market.WinningOutcome);
    }

    public static string? GetSettleFailureReason(MarketStatus status, Outcome? winningOutcome) =>
        status switch
        {
            MarketStatus.Resolved => winningOutcome.HasValue
                ? null
                : "Market must have a winning outcome before settlement.",
            MarketStatus.Settled => "Market is already settled.",
            MarketStatus.Cancelled => "Market is cancelled.",
            _ => "Only resolved markets can be settled.",
        };
}
