using Goaname.Domain.State;
using Goaname.Grains.Interfaces;

namespace Goaname.Application.Auth;

internal static class RoleRegistryMappings
{
    public static AuthorizationSnapshot ToSnapshot(RoleRegistryState state)
    {
        ArgumentNullException.ThrowIfNull(state);

        var tenantAdmins = state.TenantAdminAssignments.ToDictionary(
            static assignment => assignment.TenantId,
            static assignment => (IReadOnlyList<string>)[.. assignment.Emails],
            StringComparer.OrdinalIgnoreCase);

        return new AuthorizationSnapshot([.. state.SuperAdminEmails], tenantAdmins);
    }

    public static async Task<AuthorizationSnapshot> LoadSnapshotAsync(IGrainFactory grainFactory, CancellationToken cancellationToken = default)
    {
        var grain = grainFactory.GetGrain<IRoleRegistryGrain>(GrainKeys.PlatformRoleRegistry);
        var state = await grain.GetStateAsync().ConfigureAwait(false);
        return ToSnapshot(state);
    }
}
