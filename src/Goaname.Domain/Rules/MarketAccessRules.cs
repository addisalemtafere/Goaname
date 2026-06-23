using Goaname.Domain.Enums;
using Goaname.Domain.State;

namespace Goaname.Domain.Rules;

/// <summary>
/// Pure domain rules for tenant, market, and outcome enable/disable checks.
/// </summary>
public static class MarketAccessRules
{
    public static bool IsTenantOperational(TenantState tenant)
    {
        ArgumentNullException.ThrowIfNull(tenant);
        return tenant.OperationalStatus == TenantOperationalStatus.Active && tenant.BettingEnabled;
    }

    public static bool IsCategoryAllowed(TenantState tenant, string category)
    {
        ArgumentNullException.ThrowIfNull(tenant);

        if (tenant.EnabledCategories.Count == 0)
        {
            return true;
        }

        return tenant.EnabledCategories.Contains(category, StringComparer.OrdinalIgnoreCase);
    }

    public static bool IsMarketOpenForBetting(MarketState market)
    {
        ArgumentNullException.ThrowIfNull(market);
        return market.Status == MarketStatus.Open;
    }

    public static bool IsOutcomeEnabled(MarketState market, Outcome outcome)
    {
        ArgumentNullException.ThrowIfNull(market);

        return outcome switch
        {
            Outcome.Yes => market.YesBettingEnabled,
            Outcome.No => market.NoBettingEnabled,
            _ => false
        };
    }

    public static bool CanPlaceBet(TenantState tenant, MarketState market, Outcome outcome, decimal amount)
    {
        ArgumentNullException.ThrowIfNull(tenant);
        ArgumentNullException.ThrowIfNull(market);

        if (!IsTenantOperational(tenant))
        {
            return false;
        }

        if (!IsCategoryAllowed(tenant, market.Category))
        {
            return false;
        }

        if (!IsMarketOpenForBetting(market))
        {
            return false;
        }

        if (!IsOutcomeEnabled(market, outcome))
        {
            return false;
        }

        return amount > 0 && amount <= tenant.MaxBetAmount;
    }

    public static string? GetPlaceBetFailureReason(
        TenantState tenant,
        MarketState market,
        Outcome outcome,
        decimal amount)
    {
        ArgumentNullException.ThrowIfNull(tenant);
        ArgumentNullException.ThrowIfNull(market);

        if (!IsTenantOperational(tenant))
        {
            return "Betting is not available for this tenant.";
        }

        if (!IsCategoryAllowed(tenant, market.Category))
        {
            return $"Category '{market.Category}' is not enabled for this tenant.";
        }

        if (!IsMarketOpenForBetting(market))
        {
            return "Market is not open for betting.";
        }

        if (!IsOutcomeEnabled(market, outcome))
        {
            return $"{outcome} betting is disabled for this market.";
        }

        if (amount <= 0)
        {
            return "Bet amount must be greater than zero.";
        }

        if (amount > tenant.MaxBetAmount)
        {
            return $"Bet amount exceeds the maximum of {tenant.MaxBetAmount}.";
        }

        return null;
    }

    public static bool IsVisibleOnSite(MarketState market)
    {
        ArgumentNullException.ThrowIfNull(market);

        return market.IsVisible
            && market.Status is MarketStatus.Open or MarketStatus.Closing;
    }
}
