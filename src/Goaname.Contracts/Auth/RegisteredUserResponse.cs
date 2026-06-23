namespace Goaname.Contracts.Auth;

public sealed record RegisteredUserResponse
{
    public required Guid UserId { get; init; }
    public required string TenantId { get; init; }
    public required string DisplayName { get; init; }
    public required string Email { get; init; }
    public required IReadOnlyList<string> Roles { get; init; }
}
