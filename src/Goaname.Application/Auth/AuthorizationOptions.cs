namespace Goaname.Application.Auth;

public sealed class AuthorizationOptions
{
    public const string SectionName = "Authorization";

    public ICollection<string> SuperAdminEmails { get; init; } = [];

    public Dictionary<string, List<string>> TenantAdmins { get; init; } = new(StringComparer.OrdinalIgnoreCase);
}
