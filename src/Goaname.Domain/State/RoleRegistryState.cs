using Orleans;

namespace Goaname.Domain.State;

[GenerateSerializer]
public class RoleRegistryState
{
    [Id(0)] public bool Initialized { get; set; }

    [Id(1)] public ICollection<string> SuperAdminEmails { get; } = [];

    [Id(2)] public ICollection<TenantAdminAssignment> TenantAdminAssignments { get; } = [];
}

[GenerateSerializer]
public class TenantAdminAssignment
{
    [Id(0)] public string TenantId { get; set; } = string.Empty;

    [Id(1)] public ICollection<string> Emails { get; } = [];
}
