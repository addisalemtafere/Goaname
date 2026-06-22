using Goaname.Domain.Enums;

namespace Goaname.Contracts.Users;

public sealed record UserProfileDto
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
    public bool WithdrawalsEnabled { get; init; }
    public DateTimeOffset LastActiveAt { get; init; }
}
