using Goaname.Domain.Auth;

namespace Goaname.Application.Auth;

public sealed class PermissionChecker(IUserRoleResolver roleResolver) : IPermissionChecker
{
    public IReadOnlyList<string> GetPermissions(string tenantId, string email)
    {
        var role = GetEffectiveRole(tenantId, email);
        return GoanameRolePermissions.GetPermissionsForRole(role);
    }

    public bool IsGranted(string tenantId, string email, string permission)
    {
        var role = GetEffectiveRole(tenantId, email);
        return GoanameRolePermissions.IsGranted(role, permission);
    }

    private string GetEffectiveRole(string tenantId, string email)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(tenantId);
        ArgumentException.ThrowIfNullOrWhiteSpace(email);

        var roles = roleResolver.Resolve(tenantId, email);
        return GoanameRoles.GetEffectiveRole(roles);
    }
}
