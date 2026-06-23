namespace Goaname.Contracts.Admin;

public sealed record RoleRegistryDto
{
    public required IReadOnlyList<string> SuperAdminEmails { get; init; }
    public required IReadOnlyDictionary<string, IReadOnlyList<string>> TenantAdmins { get; init; }
}

public sealed record UpdateRoleRegistryRequest
{
    public required IReadOnlyList<string> SuperAdminEmails { get; init; }
    public required IReadOnlyDictionary<string, IReadOnlyList<string>> TenantAdmins { get; init; }
}

public sealed record TenantAdminRoleRequest
{
    public required string TenantId { get; init; }
    public required string Email { get; init; }
}

public sealed record SuperAdminRoleRequest
{
    public required string Email { get; init; }
}

public sealed record EmailRoleRequest
{
    public required string Email { get; init; }
}
