using Orleans;

namespace Goaname.Domain.State;

[GenerateSerializer]
public class UserCredentialsState
{
    [Id(0)] public Guid UserId { get; set; }
    [Id(1)] public string TenantId { get; set; } = string.Empty;
    [Id(2)] public string Email { get; set; } = string.Empty;
    [Id(3)] public string DisplayName { get; set; } = string.Empty;
    [Id(4)] public string PasswordHash { get; set; } = string.Empty;
    [Id(5)] public DateTimeOffset CreatedAt { get; set; }
}
