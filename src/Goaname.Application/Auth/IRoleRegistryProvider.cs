namespace Goaname.Application.Auth;

public sealed record AuthorizationSnapshot
{
    public static AuthorizationSnapshot Empty { get; } = new([], new Dictionary<string, IReadOnlyList<string>>(StringComparer.OrdinalIgnoreCase));

    public AuthorizationSnapshot(
        IReadOnlyList<string> superAdminEmails,
        IReadOnlyDictionary<string, IReadOnlyList<string>> tenantAdmins)
    {
        SuperAdminEmails = superAdminEmails;
        TenantAdmins = tenantAdmins;
    }

    public IReadOnlyList<string> SuperAdminEmails { get; }

    public IReadOnlyDictionary<string, IReadOnlyList<string>> TenantAdmins { get; }
}

public interface IRoleRegistryProvider
{
    public AuthorizationSnapshot GetCurrent();

    public Task RefreshAsync(CancellationToken cancellationToken = default);
}
