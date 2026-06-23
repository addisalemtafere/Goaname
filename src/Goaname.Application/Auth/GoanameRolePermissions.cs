using Goaname.Domain.Auth;

namespace Goaname.Application.Auth;

public static class GoanameRolePermissions
{
    private static readonly Dictionary<string, IReadOnlySet<string>> RoleMap =
        new(StringComparer.Ordinal)
        {
            [GoanameRoles.SuperAdmin] = AllPermissions(),
            [GoanameRoles.TenantAdmin] = new HashSet<string>(StringComparer.Ordinal)
            {
                GoanamePermissions.TenantAdmin.Overview,
                GoanamePermissions.TenantAdmin.Markets,
                GoanamePermissions.TenantAdmin.Categories,
                GoanamePermissions.TenantAdmin.Users,
                GoanamePermissions.TenantAdmin.UsersAdjustWallet,
                GoanamePermissions.TenantAdmin.UsersSetKyc,
                GoanamePermissions.TenantAdmin.UsersGrantAdmin,
                GoanamePermissions.TenantAdmin.Settings,
                GoanamePermissions.User.Bets,
                GoanamePermissions.User.Profile,
                GoanamePermissions.User.Wallet,
            },
            [GoanameRoles.User] = new HashSet<string>(StringComparer.Ordinal)
            {
                GoanamePermissions.User.Bets,
                GoanamePermissions.User.Profile,
                GoanamePermissions.User.Wallet,
            },
        };

    public static IReadOnlyList<string> GetPermissionsForRole(string role)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(role);

        return RoleMap.TryGetValue(role, out var permissions)
            ? [.. permissions.OrderBy(static value => value, StringComparer.Ordinal)]
            : [];
    }

    public static IReadOnlyDictionary<string, IReadOnlyList<string>> GetRolePermissionMatrix() =>
        RoleMap.ToDictionary(
            static pair => pair.Key,
            static pair => (IReadOnlyList<string>)[.. pair.Value.OrderBy(static value => value, StringComparer.Ordinal)],
            StringComparer.Ordinal);

    public static bool IsGranted(string role, string permission)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(role);
        ArgumentException.ThrowIfNullOrWhiteSpace(permission);

        if (!RoleMap.TryGetValue(role, out var permissions))
        {
            return false;
        }

        return permissions.Contains(permission);
    }

    private static HashSet<string> AllPermissions() =>
        new(PermissionDefinitionProvider.GetAllNames(), StringComparer.Ordinal);
}
