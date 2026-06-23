namespace Goaname.Contracts.Auth;

public sealed record RegisterRequest
{
    public required string TenantId { get; init; }
    public required string DisplayName { get; init; }
    public required string Email { get; init; }
    public required string Password { get; init; }
}

public sealed record LoginRequest
{
    public required string TenantId { get; init; }
    public required string Email { get; init; }
    public required string Password { get; init; }
}

public sealed record AuthResponse
{
    public required string AccessToken { get; init; }
    public required Guid UserId { get; init; }
    public required string TenantId { get; init; }
    public required string DisplayName { get; init; }
    public required string Email { get; init; }
    public required DateTimeOffset ExpiresAt { get; init; }
}
