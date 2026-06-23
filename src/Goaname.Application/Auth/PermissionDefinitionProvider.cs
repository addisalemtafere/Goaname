using Goaname.Domain.Auth;

namespace Goaname.Application.Auth;

public static class PermissionDefinitionProvider
{
    private static readonly IReadOnlyList<PermissionDefinition> Definitions =
    [
        new(GoanamePermissions.Platform.Tenants, "Manage tenants", GoanamePermissions.Platform.GroupName, GoanamePermissions.Platform.Default),
        new(GoanamePermissions.Platform.Roles, "Manage roles", GoanamePermissions.Platform.GroupName, GoanamePermissions.Platform.Default),
        new(GoanamePermissions.Platform.Clients, "Manage OAuth clients", GoanamePermissions.Platform.GroupName, GoanamePermissions.Platform.Default),
        new(GoanamePermissions.Platform.Settings, "Platform settings", GoanamePermissions.Platform.GroupName, GoanamePermissions.Platform.Default),
        new(GoanamePermissions.Platform.Dashboard, "Orleans dashboard", GoanamePermissions.Platform.GroupName, GoanamePermissions.Platform.Default),

        new(GoanamePermissions.TenantAdmin.Overview, "Tenant overview", GoanamePermissions.TenantAdmin.GroupName, GoanamePermissions.TenantAdmin.Default),
        new(GoanamePermissions.TenantAdmin.Markets, "Manage markets", GoanamePermissions.TenantAdmin.GroupName, GoanamePermissions.TenantAdmin.Default),
        new(GoanamePermissions.TenantAdmin.Categories, "Manage categories", GoanamePermissions.TenantAdmin.GroupName, GoanamePermissions.TenantAdmin.Default),
        new(GoanamePermissions.TenantAdmin.Users, "View users", GoanamePermissions.TenantAdmin.GroupName, GoanamePermissions.TenantAdmin.Default),
        new(GoanamePermissions.TenantAdmin.UsersAdjustWallet, "Adjust player wallets", GoanamePermissions.TenantAdmin.GroupName, GoanamePermissions.TenantAdmin.Users),
        new(GoanamePermissions.TenantAdmin.UsersSetKyc, "Update KYC status", GoanamePermissions.TenantAdmin.GroupName, GoanamePermissions.TenantAdmin.Users),
        new(GoanamePermissions.TenantAdmin.UsersGrantAdmin, "Grant tenant admin", GoanamePermissions.TenantAdmin.GroupName, GoanamePermissions.TenantAdmin.Users),
        new(GoanamePermissions.TenantAdmin.Settings, "Tenant settings", GoanamePermissions.TenantAdmin.GroupName, GoanamePermissions.TenantAdmin.Default),

        new(GoanamePermissions.User.Bets, "Place bets", GoanamePermissions.User.GroupName, GoanamePermissions.User.Default),
        new(GoanamePermissions.User.Profile, "Manage profile", GoanamePermissions.User.GroupName, GoanamePermissions.User.Default),
        new(GoanamePermissions.User.Wallet, "Manage wallet", GoanamePermissions.User.GroupName, GoanamePermissions.User.Default),
    ];

    public static IReadOnlyList<PermissionDefinition> All => Definitions;

    public static IReadOnlyList<string> GetAllNames() =>
        Definitions.Select(static definition => definition.Name).ToList();
}
