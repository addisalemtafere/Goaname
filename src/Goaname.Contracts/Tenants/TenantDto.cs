using Goaname.Domain.Enums;

namespace Goaname.Contracts.Tenants;

public sealed record TenantDto
{
    public required string TenantId { get; init; }
    public required string Name { get; init; }
    public TenantOperationalStatus OperationalStatus { get; init; }
    public bool BettingEnabled { get; init; }
    public bool DepositsEnabled { get; init; }
    public bool WithdrawalsEnabled { get; init; }
    public IReadOnlyList<string> EnabledCategories { get; init; } = [];
    public required string Currency { get; init; }
    public decimal PlatformFeePercent { get; init; }
    public decimal MaxBetAmount { get; init; }
    public decimal DefaultLiquidityParameter { get; init; }
    public string? ThemeKey { get; init; }
    public string? SuspensionReason { get; init; }
    public DateTimeOffset LastUpdatedAt { get; init; }
}
