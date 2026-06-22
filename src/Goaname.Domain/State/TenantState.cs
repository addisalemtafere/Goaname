using Goaname.Domain.Enums;
using Orleans;

namespace Goaname.Domain.State;

/// <summary>
/// Orleans state for tenant configuration and enable/disable switches.
/// Grain key: {tenantId}_tenant
/// </summary>
[GenerateSerializer]
public class TenantState
{
    [Id(0)] public string TenantId { get; set; } = string.Empty;
    [Id(1)] public string Name { get; set; } = string.Empty;
    [Id(2)] public TenantOperationalStatus OperationalStatus { get; set; } = TenantOperationalStatus.Active;

    /// <summary>Master switch: when false, no betting on any market for this tenant.</summary>
    [Id(3)] public bool BettingEnabled { get; set; } = true;

    [Id(4)] public bool DepositsEnabled { get; set; } = true;
    [Id(5)] public bool WithdrawalsEnabled { get; set; } = true;

    /// <summary>Empty collection means all categories are allowed.</summary>
    [Id(6)] public ICollection<string> EnabledCategories { get; } = [];

    [Id(7)] public string Currency { get; set; } = "USD";
    [Id(8)] public decimal PlatformFeePercent { get; set; } = 2.5m;
    [Id(9)] public decimal MaxBetAmount { get; set; } = 10_000m;
    [Id(10)] public decimal DefaultLiquidityParameter { get; set; } = 1000m;

    [Id(11)] public string? ThemeKey { get; set; }
    [Id(12)] public string? SuspensionReason { get; set; }
    [Id(13)] public DateTimeOffset LastUpdatedAt { get; set; }
}
