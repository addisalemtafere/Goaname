using System.Security.Claims;
using Goaname.Application.Auth;
using Goaname.Domain.Auth;
using Goaname.Grains.Interfaces;
using Goaname.Presentation.Extensions;
using Microsoft.IdentityModel.Tokens;
using OpenIddict.Abstractions;
using static OpenIddict.Abstractions.OpenIddictConstants;

namespace Goaname.Presentation.Auth;

internal sealed class PasswordGrantAuthenticator(
    IGrainFactory grainFactory,
    IUserRoleResolver roleResolver)
{
    public async Task<ClaimsPrincipal?> AuthenticateAsync(
        string tenantId,
        string email,
        string password,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(tenantId);
        ArgumentException.ThrowIfNullOrWhiteSpace(email);
        ArgumentException.ThrowIfNullOrWhiteSpace(password);

        var normalizedEmail = email.Trim().ToUpperInvariant();
        var authGrain = grainFactory.GetGrain<IUserAuthGrain>(GrainKeys.UserAuth(tenantId.Trim(), normalizedEmail));
        var credentials = await authGrain.GetStateAsync().ConfigureAwait(false);

        if (string.IsNullOrEmpty(credentials.Email))
        {
            return null;
        }

        var isValid = await authGrain.ValidatePasswordAsync(password).ConfigureAwait(false);
        if (!isValid)
        {
            return null;
        }

        var roles = roleResolver.Resolve(credentials.TenantId, credentials.Email);
        return AuthPrincipalFactory.Create(
            credentials.UserId,
            credentials.TenantId,
            credentials.DisplayName,
            credentials.Email,
            roles);
    }
}

internal static class AuthPrincipalFactory
{
    public static ClaimsPrincipal Create(
        Guid userId,
        string tenantId,
        string displayName,
        string email,
        IReadOnlyList<string> roles)
    {
        var identity = new ClaimsIdentity(
            authenticationType: TokenValidationParameters.DefaultAuthenticationType,
            nameType: ClaimTypes.Name,
            roleType: ClaimTypes.Role);

        identity.SetClaim(Claims.Subject, userId.ToString())
            .SetClaim(ClaimTypes.NameIdentifier, userId.ToString())
            .SetClaim(Claims.Name, displayName)
            .SetClaim(ClaimTypes.Name, displayName)
            .SetClaim(Claims.Email, email)
            .SetClaim(ClaimTypes.Email, email)
            .SetClaim(HttpContextUserExtensions.TenantIdClaimType, tenantId);

        var effectiveRole = GoanameRoles.GetEffectiveRole(roles);
        identity.AddClaim(new Claim(Claims.Role, effectiveRole));
        identity.AddClaim(new Claim(ClaimTypes.Role, effectiveRole));

        identity.SetScopes(Scopes.OpenId, Scopes.Profile, Scopes.Email, Scopes.OfflineAccess);
        identity.SetDestinations(static claim => claim.Type switch
        {
            Claims.Subject or Claims.Name or ClaimTypes.NameIdentifier or ClaimTypes.Name or Claims.Email or ClaimTypes.Email
                or HttpContextUserExtensions.TenantIdClaimType => [Destinations.AccessToken, Destinations.IdentityToken],
            Claims.Role or ClaimTypes.Role => [Destinations.AccessToken],
            _ => [Destinations.AccessToken],
        });

        return new ClaimsPrincipal(identity);
    }
}
