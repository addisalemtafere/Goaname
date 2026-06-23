using System.Security.Claims;

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

    public static string GetTenantId(this HttpContext context, string routeTenantId)
    {
        ArgumentNullException.ThrowIfNull(context);
        ArgumentException.ThrowIfNullOrWhiteSpace(routeTenantId);

        var claimTenantId = context.User.FindFirstValue(TenantIdClaimType);
        if (!string.IsNullOrWhiteSpace(claimTenantId) &&
            !string.Equals(claimTenantId, routeTenantId, StringComparison.OrdinalIgnoreCase))
        {
            throw new UnauthorizedAccessException("Token tenant does not match the requested tenant.");
        }

        return routeTenantId;
    }
}
