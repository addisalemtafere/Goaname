using System.Security.Claims;
using Goaname.Contracts.Auth;
using Goaname.Domain.Auth;
using Goaname.Presentation.Extensions;
using OpenIddict.Abstractions;
using static OpenIddict.Abstractions.OpenIddictConstants;

namespace Goaname.Presentation.Auth;

internal static class AuthResponseMapper
{
    public static AuthResponse FromPrincipal(ClaimsPrincipal principal, string accessToken, DateTimeOffset expiresAt)
    {
        ArgumentNullException.ThrowIfNull(principal);
        ArgumentException.ThrowIfNullOrWhiteSpace(accessToken);

        var userId = Guid.Parse(principal.GetClaim(Claims.Subject)!);
        var tenantId = principal.GetClaim(HttpContextUserExtensions.TenantIdClaimType)!;
        var displayName = principal.GetClaim(Claims.Name)!;
        var email = principal.GetClaim(Claims.Email)!;

        return new AuthResponse
        {
            AccessToken = accessToken,
            UserId = userId,
            TenantId = tenantId,
            DisplayName = displayName,
            Email = email,
            ExpiresAt = expiresAt,
            Roles = [GoanameRoles.GetEffectiveRole(principal.GetRoles())],
        };
    }
}
