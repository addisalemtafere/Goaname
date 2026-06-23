using Goaname.Grains.Interfaces;

namespace Goaname.Application.Auth;

public sealed class RoleRegistryProvider(IGrainFactory grainFactory) : IRoleRegistryProvider
{
    private AuthorizationSnapshot _snapshot = AuthorizationSnapshot.Empty;

    public AuthorizationSnapshot GetCurrent() => _snapshot;

    public async Task RefreshAsync(CancellationToken cancellationToken = default)
    {
        _snapshot = await RoleRegistryMappings.LoadSnapshotAsync(grainFactory, cancellationToken).ConfigureAwait(false);
    }
}
