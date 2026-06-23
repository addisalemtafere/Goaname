namespace Goaname.Domain.Auth;

public static class GoanameRoles
{
    public const string User = "User";
    public const string TenantAdmin = "TenantAdmin";
    public const string SuperAdmin = "SuperAdmin";

    public static string GetEffectiveRole(IEnumerable<string> roles)
    {
        var set = roles as ISet<string> ?? roles.ToHashSet(StringComparer.Ordinal);

        if (set.Contains(SuperAdmin))
        {
            return SuperAdmin;
        }

        if (set.Contains(TenantAdmin))
        {
            return TenantAdmin;
        }

        return User;
    }
}
