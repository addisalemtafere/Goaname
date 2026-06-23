using Goaname.Domain.Enums;
using Goaname.Domain.Math;
using Goaname.Domain.State;

namespace Goaname.Domain.Rules;

/// <summary>
/// Pure rules for market bet placement and LMSR pricing.
/// </summary>
public static class MarketBetRules
{
    private const decimal ProbabilityFloor = 0.01m;

    public static string? GetPlacementFailureReason(
        TenantState tenant,
        MarketState market,
        Outcome outcome,
        decimal amount,
        DateTimeOffset utcNow)
    {
        ArgumentNullException.ThrowIfNull(tenant);
        ArgumentNullException.ThrowIfNull(market);

        var accessFailure = MarketAccessRules.GetPlaceBetFailureReason(tenant, market, outcome, amount);
        if (accessFailure is not null)
        {
            return accessFailure;
        }

        if (!MarketLifecycleRules.IsTradingWindowOpen(market, utcNow))
        {
            return "Trading window has closed for this market.";
        }

        return null;
    }

    public static decimal CalculateEffectiveBetAmount(decimal amount, decimal platformFeePercent)
    {
        if (amount <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(amount), "Bet amount must be greater than zero.");
        }

        if (platformFeePercent is < 0 or > 100)
        {
            throw new ArgumentOutOfRangeException(nameof(platformFeePercent), "Platform fee must be between 0 and 100.");
        }

        var fee = amount * (platformFeePercent / 100m);
        return amount - fee;
    }

    public static decimal GetOddsMultiplier(decimal yesProbability, decimal noProbability, Outcome outcome) =>
        outcome switch
        {
            Outcome.Yes => 1m / System.Math.Max(yesProbability, ProbabilityFloor),
            Outcome.No => 1m / System.Math.Max(noProbability, ProbabilityFloor),
            _ => throw new ArgumentOutOfRangeException(nameof(outcome), outcome, "Unsupported outcome."),
        };

    public static decimal CalculateSharesReceived(MarketState market, Outcome outcome, decimal effectiveBetAmount)
    {
        ArgumentNullException.ThrowIfNull(market);

        return LmsrCalculator.CalculateSharesReceived(
            market.YesVolume,
            market.NoVolume,
            market.LiquidityParameter,
            outcome,
            effectiveBetAmount);
    }

    public static void ApplyVolumeDelta(MarketState market, Outcome outcome, decimal sharesReceived)
    {
        ArgumentNullException.ThrowIfNull(market);

        if (outcome == Outcome.Yes)
        {
            market.YesVolume += sharesReceived;
        }
        else
        {
            market.NoVolume += sharesReceived;
        }

        var (yesProbability, noProbability) = LmsrCalculator.CalculateProbabilities(
            market.YesVolume,
            market.NoVolume,
            market.LiquidityParameter);

        market.YesProbability = yesProbability;
        market.NoProbability = noProbability;
    }

    public static bool RecordTrader(MarketState market, Guid userId)
    {
        ArgumentNullException.ThrowIfNull(market);

        if (!market.TradedUserIds.Add(userId))
        {
            return false;
        }

        market.UniqueTradersCount++;
        return true;
    }
}
