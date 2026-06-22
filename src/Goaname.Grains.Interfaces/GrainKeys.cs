namespace Goaname.Grains.Interfaces;

public static class GrainKeys
{
    public const string MarketKeySeparator = "_market_";

    public static string Tenant(string tenantId) => $"{tenantId}_tenant";
    public static string Market(string tenantId, Guid marketId) => $"{tenantId}{MarketKeySeparator}{marketId}";
    public static string User(string tenantId, Guid userId) => $"{tenantId}_user_{userId}";
    public static string UserAuth(string tenantId, string email)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(tenantId);
        ArgumentException.ThrowIfNullOrWhiteSpace(email);
        return $"{tenantId}_auth_{NormalizeEmail(email)}";
    }

    public static string BetSlip(string tenantId, Guid betSlipId) => $"{tenantId}_betslip_{betSlipId}";
    public static string MarketCatalog(string tenantId) => $"{tenantId}_marketcatalog";

    public static Guid ParseBetSlipId(string betSlipGrainKey)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(betSlipGrainKey);

        const string suffix = "_betslip_";
        var separatorIndex = betSlipGrainKey.LastIndexOf(suffix, StringComparison.Ordinal);
        if (separatorIndex < 0)
        {
            throw new ArgumentException($"Invalid bet slip grain key: {betSlipGrainKey}", nameof(betSlipGrainKey));
        }

        return Guid.Parse(betSlipGrainKey[(separatorIndex + suffix.Length)..]);
    }

    public static string ParseTenantIdFromBetSlipKey(string betSlipGrainKey)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(betSlipGrainKey);

        const string suffix = "_betslip_";
        var separatorIndex = betSlipGrainKey.LastIndexOf(suffix, StringComparison.Ordinal);
        if (separatorIndex < 0)
        {
            throw new ArgumentException($"Invalid bet slip grain key: {betSlipGrainKey}", nameof(betSlipGrainKey));
        }

        return betSlipGrainKey[..separatorIndex];
    }

    public static Guid ParseMarketId(string marketGrainKey)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(marketGrainKey);

        var separatorIndex = marketGrainKey.LastIndexOf(MarketKeySeparator, StringComparison.Ordinal);
        if (separatorIndex < 0)
        {
            throw new ArgumentException($"Invalid market grain key: {marketGrainKey}", nameof(marketGrainKey));
        }

        return Guid.Parse(marketGrainKey[(separatorIndex + MarketKeySeparator.Length)..]);
    }

    public static string ParseTenantIdFromMarketKey(string marketGrainKey)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(marketGrainKey);

        var separatorIndex = marketGrainKey.LastIndexOf(MarketKeySeparator, StringComparison.Ordinal);
        if (separatorIndex < 0)
        {
            throw new ArgumentException($"Invalid market grain key: {marketGrainKey}", nameof(marketGrainKey));
        }

        return marketGrainKey[..separatorIndex];
    }

    private static string NormalizeEmail(string email) =>
        email.Trim().ToUpperInvariant();
}
