namespace Goaname.Grains.Interfaces;

public static class GrainKeys
{
    public static string Tenant(string tenantId) => $"{tenantId}_tenant";
    public static string Market(string tenantId, Guid marketId) => $"{tenantId}_market_{marketId}";
    public static string User(string tenantId, Guid userId) => $"{tenantId}_user_{userId}";
    public static string UserAuth(string tenantId, string email)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(tenantId);
        ArgumentException.ThrowIfNullOrWhiteSpace(email);
        return $"{tenantId}_auth_{NormalizeEmail(email)}";
    }

    public static string BetSlip(string tenantId, Guid betSlipId) => $"{tenantId}_betslip_{betSlipId}";

    private static string NormalizeEmail(string email) =>
        email.Trim().ToUpperInvariant();
}
