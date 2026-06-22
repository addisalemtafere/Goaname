namespace Goaname.Contracts.Auth;

public sealed record DevTokenRequest
{
    public required string TenantId { get; init; }
    public Guid UserId { get; init; } = Guid.NewGuid();
    public string DisplayName { get; init; } = "Demo User";
    public string Email { get; init; } = "demo@goaname.local";
}

public sealed record DevTokenResponse
{
    public required string AccessToken { get; init; }
    public required Guid UserId { get; init; }
    public required string TenantId { get; init; }
    public required DateTimeOffset ExpiresAt { get; init; }
}
