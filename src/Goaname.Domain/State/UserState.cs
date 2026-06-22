using Goaname.Domain.Enums;
using Orleans;

namespace Goaname.Domain.State;

[GenerateSerializer]
public class UserState
{
    [Id(0)] public Guid UserId { get; set; }
    [Id(1)] public string TenantId { get; set; } = string.Empty;
    [Id(2)] public string DisplayName { get; set; } = string.Empty;
    [Id(3)] public string Email { get; set; } = string.Empty;
    [Id(4)] public string PreferredCurrency { get; set; } = "USD";
    [Id(5)] public KycStatus KycStatus { get; set; } = KycStatus.NotStarted;
    [Id(6)] public string? PayoutProvider { get; set; }
    [Id(7)] public string? PayoutAccountId { get; set; }
    [Id(8)] public DateTimeOffset? PayoutAccountVerifiedAt { get; set; }
    [Id(9)] public WalletState Wallet { get; set; } = new();
    [Id(10)] public DateTimeOffset CreatedAt { get; set; }
    [Id(11)] public DateTimeOffset LastActiveAt { get; set; }
}
