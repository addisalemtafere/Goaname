using Goaname.Domain.Enums;

namespace Goaname.Contracts.Admin;

public sealed record TenantSummaryDto
{
    public required string TenantId { get; init; }
    public required string Name { get; init; }
    public TenantOperationalStatus OperationalStatus { get; init; }
    public bool BettingEnabled { get; init; }
    public required string Currency { get; init; }
    public DateTimeOffset LastUpdatedAt { get; init; }
}

public sealed record UpdateTenantSettingsRequest
{
    public string? Name { get; init; }
    public TenantOperationalStatus? OperationalStatus { get; init; }
    public bool? BettingEnabled { get; init; }
    public bool? DepositsEnabled { get; init; }
    public bool? WithdrawalsEnabled { get; init; }
    public decimal? PlatformFeePercent { get; init; }
    public decimal? MaxBetAmount { get; init; }
    public decimal? DefaultLiquidityParameter { get; init; }
    public string? ThemeKey { get; init; }
    public string? SuspensionReason { get; init; }
}

public sealed record UserSummaryDto
{
    public required Guid UserId { get; init; }
    public required string DisplayName { get; init; }
    public required string Email { get; init; }
    public KycStatus KycStatus { get; init; }
    public decimal Balance { get; init; }
    public required string Currency { get; init; }
    public DateTimeOffset LastActiveAt { get; init; }
    public IReadOnlyList<string> Roles { get; init; } = [];
}

public sealed record AdminUserDto
{
    public required Guid UserId { get; init; }
    public required string TenantId { get; init; }
    public required string DisplayName { get; init; }
    public required string Email { get; init; }
    public required string PreferredCurrency { get; init; }
    public KycStatus KycStatus { get; init; }
    public string? PayoutProvider { get; init; }
    public string? PayoutAccountId { get; init; }
    public DateTimeOffset? PayoutAccountVerifiedAt { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset LastActiveAt { get; init; }
    public decimal Balance { get; init; }
    public decimal TotalDeposited { get; init; }
    public decimal TotalWithdrawn { get; init; }
    public IReadOnlyList<string> Roles { get; init; } = [];
}

public sealed record AdjustUserWalletRequest
{
    public required decimal Amount { get; init; }
}

public sealed record SetUserKycStatusRequest
{
    public required KycStatus Status { get; init; }
}

public sealed record OAuthClientDto
{
    public required string ClientId { get; init; }
    public required string DisplayName { get; init; }
    public required string ClientType { get; init; }
    public IReadOnlyList<string> Permissions { get; init; } = [];
    public IReadOnlyList<string> RedirectUris { get; init; } = [];
}

public sealed record CreateOAuthClientRequest
{
    public required string ClientId { get; init; }
    public required string DisplayName { get; init; }
    public string ClientType { get; init; } = "public";
    public IReadOnlyList<string> RedirectUris { get; init; } = [];
    public IReadOnlyList<string> Permissions { get; init; } = [];
}

public sealed record UpdateOAuthClientRequest
{
    public required string DisplayName { get; init; }
    public IReadOnlyList<string> RedirectUris { get; init; } = [];
    public IReadOnlyList<string> Permissions { get; init; } = [];
}

public sealed record AppSettingsDto
{
    public required string SpaClientId { get; init; }
    public int TokenLifetimeHours { get; init; }
    public bool LocalAuthEnabled { get; init; }
    public IReadOnlyList<string> SuperAdminEmails { get; init; } = [];
    public IReadOnlyDictionary<string, IReadOnlyList<string>> TenantAdmins { get; init; }
        = new Dictionary<string, IReadOnlyList<string>>();
}

public sealed record BackOfficeOverviewDto
{
    public int TenantCount { get; init; }
    public int UserCount { get; init; }
    public int OAuthClientCount { get; init; }
    public required string ActiveTenantId { get; init; }
}
