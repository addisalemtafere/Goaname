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
}
