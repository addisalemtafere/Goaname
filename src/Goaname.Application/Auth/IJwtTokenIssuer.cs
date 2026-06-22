namespace Goaname.Application.Auth;

public sealed record AuthTokenResult(
    string AccessToken,
    Guid UserId,
    string TenantId,
    string DisplayName,
    string Email,
    DateTimeOffset ExpiresAt);

public interface IJwtTokenIssuer
{
    public AuthTokenResult IssueToken(Guid userId, string tenantId, string displayName, string email);
}
