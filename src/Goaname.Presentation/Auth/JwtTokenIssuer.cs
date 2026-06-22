using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Goaname.Application.Auth;
using Goaname.Presentation.Configuration;
using Goaname.Presentation.Extensions;
using Microsoft.IdentityModel.Tokens;

namespace Goaname.Presentation.Auth;

internal sealed class JwtTokenIssuer(IConfiguration configuration) : IJwtTokenIssuer
{
    public AuthTokenResult IssueToken(Guid userId, string tenantId, string displayName, string email)
    {
        var jwtOptions = JwtConfiguration.GetOptions(configuration);
        if (string.IsNullOrWhiteSpace(jwtOptions.SigningKey))
        {
            throw new InvalidOperationException("JWT signing key is not configured.");
        }

        var expiresAt = DateTimeOffset.UtcNow.AddHours(jwtOptions.TokenLifetimeHours);
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId.ToString()),
            new("sub", userId.ToString()),
            new(ClaimTypes.Name, displayName),
            new(ClaimTypes.Email, email),
            new(HttpContextUserExtensions.TenantIdClaimType, tenantId),
        };

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SigningKey)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            jwtOptions.Issuer,
            jwtOptions.Audience,
            claims,
            expires: expiresAt.UtcDateTime,
            signingCredentials: credentials);

        return new AuthTokenResult(
            new JwtSecurityTokenHandler().WriteToken(token),
            userId,
            tenantId,
            displayName,
            email,
            expiresAt);
    }
}
