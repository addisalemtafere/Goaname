using Goaname.Application.Auth;
using Goaname.Grains.Interfaces;

namespace Goaname.Application.Features.Admin.RoleRegistry;

public sealed class RoleRegistryService(IGrainFactory grainFactory, IRoleRegistryProvider provider)
{
    private IRoleRegistryGrain Grain =>
        grainFactory.GetGrain<IRoleRegistryGrain>(GrainKeys.PlatformRoleRegistry);

    public async Task<AuthorizationSnapshot> GetSnapshotAsync(CancellationToken cancellationToken = default)
    {
        await provider.RefreshAsync(cancellationToken).ConfigureAwait(false);
        return provider.GetCurrent();
    }

    public async Task ReplaceAsync(
        IReadOnlyList<string> superAdminEmails,
        IReadOnlyDictionary<string, IReadOnlyList<string>> tenantAdmins,
        CancellationToken cancellationToken = default)
    {
        await Grain.ReplaceAsync(superAdminEmails, tenantAdmins).ConfigureAwait(false);
        await provider.RefreshAsync(cancellationToken).ConfigureAwait(false);
    }

    public async Task AddSuperAdminAsync(string email, CancellationToken cancellationToken = default)
    {
        await Grain.AddSuperAdminAsync(email).ConfigureAwait(false);
        await provider.RefreshAsync(cancellationToken).ConfigureAwait(false);
    }

    public async Task RemoveSuperAdminAsync(string email, CancellationToken cancellationToken = default)
    {
        await Grain.RemoveSuperAdminAsync(email).ConfigureAwait(false);
        await provider.RefreshAsync(cancellationToken).ConfigureAwait(false);
    }

    public async Task AddTenantAdminAsync(string tenantId, string email, CancellationToken cancellationToken = default)
    {
        await Grain.AddTenantAdminAsync(tenantId, email).ConfigureAwait(false);
        await provider.RefreshAsync(cancellationToken).ConfigureAwait(false);
    }

    public async Task RemoveTenantAdminAsync(string tenantId, string email, CancellationToken cancellationToken = default)
    {
        await Grain.RemoveTenantAdminAsync(tenantId, email).ConfigureAwait(false);
        await provider.RefreshAsync(cancellationToken).ConfigureAwait(false);
    }
}
