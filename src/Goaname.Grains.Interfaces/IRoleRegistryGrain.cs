using Goaname.Domain.State;

namespace Goaname.Grains.Interfaces;

[Alias("Goaname.Grains.Interfaces.IRoleRegistryGrain")]
public interface IRoleRegistryGrain : IGrainWithStringKey
{
    [Alias("GetStateAsync")]
    public Task<RoleRegistryState> GetStateAsync();

    [Alias("EnsureSeededAsync")]
    public Task EnsureSeededAsync(
        IReadOnlyList<string> superAdminEmails,
        IReadOnlyDictionary<string, IReadOnlyList<string>> tenantAdmins);

    [Alias("ReplaceAsync")]
    public Task ReplaceAsync(
        IReadOnlyList<string> superAdminEmails,
        IReadOnlyDictionary<string, IReadOnlyList<string>> tenantAdmins);

    [Alias("AddSuperAdminAsync")]
    public Task AddSuperAdminAsync(string email);

    [Alias("RemoveSuperAdminAsync")]
    public Task RemoveSuperAdminAsync(string email);

    [Alias("AddTenantAdminAsync")]
    public Task AddTenantAdminAsync(string tenantId, string email);

    [Alias("RemoveTenantAdminAsync")]
    public Task RemoveTenantAdminAsync(string tenantId, string email);
}
