using System.Security.Claims;
using Goaname.Domain.Auth;
using static OpenIddict.Abstractions.OpenIddictConstants;

namespace Goaname.Presentation.Extensions;

internal static class HttpContextUserExtensions
{
    public const string TenantIdClaimType = "tenant_id";

    public static Guid GetUserId(this HttpContext context)
    {
        ArgumentNullException.ThrowIfNull(context);

        var value = context.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? context.User.FindFirstValue("sub");

        if (!Guid.TryParse(value, out var userId))
        {
            throw new UnauthorizedAccessException("User identifier claim is missing or invalid.");
        }

        return userId;
    }

    public static bool IsSuperAdmin(this ClaimsPrincipal user) =>
        user.IsInRole(GoanameRoles.SuperAdmin);

    public static bool IsTenantAdmin(this ClaimsPrincipal user) =>
        user.IsInRole(GoanameRoles.TenantAdmin) || user.IsInRole(GoanameRoles.SuperAdmin);

    public static string GetTenantId(this HttpContext context, string routeTenantId)
    {
        ArgumentNullException.ThrowIfNull(context);
        ArgumentException.ThrowIfNullOrWhiteSpace(routeTenantId);

        var normalizedRouteTenantId = routeTenantId.Trim();

        if (context.User.IsSuperAdmin())
        {
            return normalizedRouteTenantId;
        }

        var claimTenantId = context.User.FindFirstValue(TenantIdClaimType);
        if (!string.IsNullOrWhiteSpace(claimTenantId) &&
            !string.Equals(claimTenantId, normalizedRouteTenantId, StringComparison.OrdinalIgnoreCase))
        {
            throw new UnauthorizedAccessException("Token tenant does not match the requested tenant.");
        }

        return normalizedRouteTenantId;
    }

    public static IReadOnlyList<string> GetRoles(this ClaimsPrincipal user) =>
        user.FindAll(ClaimTypes.Role)
            .Concat(user.FindAll(Claims.Role))
            .Select(claim => claim.Value)
            .Where(role => !string.IsNullOrWhiteSpace(role))
            .Distinct(StringComparer.Ordinal)
            .ToList();
}
