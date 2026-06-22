namespace Goaname.Grains.Interfaces;

public static class GrainKeys
{
    public static string Tenant(string tenantId) => $"{tenantId}_tenant";
    public static string Market(string tenantId, Guid marketId) => $"{tenantId}_market_{marketId}";
    public static string User(string tenantId, Guid userId) => $"{tenantId}_user_{userId}";
    public static string BetSlip(string tenantId, Guid betSlipId) => $"{tenantId}_betslip_{betSlipId}";
}
