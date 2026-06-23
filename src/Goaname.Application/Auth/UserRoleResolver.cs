using Goaname.Domain.Auth;

namespace Goaname.Application.Auth;

public sealed class UserRoleResolver(IRoleRegistryProvider roleRegistryProvider) : IUserRoleResolver
{
    public IReadOnlyList<string> Resolve(string tenantId, string email)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(tenantId);
        ArgumentException.ThrowIfNullOrWhiteSpace(email);

        var normalizedEmail = email.Trim().ToUpperInvariant();
        var settings = roleRegistryProvider.GetCurrent();

        if (IsListed(normalizedEmail, settings.SuperAdminEmails))
        {
            return [GoanameRoles.SuperAdmin];
        }

        if (settings.TenantAdmins.TryGetValue(tenantId.Trim(), out var tenantAdmins) &&
            IsListed(normalizedEmail, tenantAdmins))
        {
            return [GoanameRoles.TenantAdmin];
        }

        return [GoanameRoles.User];
    }

    private static bool IsListed(string normalizedEmail, IEnumerable<string> emails) =>
        emails.Any(candidate => string.Equals(candidate.Trim().ToUpperInvariant(), normalizedEmail, StringComparison.Ordinal));
}
