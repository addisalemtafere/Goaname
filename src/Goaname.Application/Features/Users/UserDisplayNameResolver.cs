using Goaname.Application.Common.Mappings;
using Goaname.Grains.Interfaces;

namespace Goaname.Application.Features.Users;

public interface IUserDisplayNameResolver
{
    public Task<IReadOnlyDictionary<Guid, string>> ResolveAsync(
        string tenantId,
        IEnumerable<Guid> userIds,
        CancellationToken cancellationToken = default);
}

public sealed class UserDisplayNameResolver(IGrainFactory grainFactory) : IUserDisplayNameResolver
{
    public async Task<IReadOnlyDictionary<Guid, string>> ResolveAsync(
        string tenantId,
        IEnumerable<Guid> userIds,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(userIds);

        var distinctUserIds = userIds.Distinct().ToList();
        if (distinctUserIds.Count == 0)
        {
            return new Dictionary<Guid, string>();
        }

        var results = await Task.WhenAll(
            distinctUserIds.Select(async userId =>
            {
                cancellationToken.ThrowIfCancellationRequested();

                var state = await grainFactory
                    .GetGrain<IUserGrain>(GrainKeys.User(tenantId, userId))
                    .GetStateAsync()
                    .ConfigureAwait(false);

                return new KeyValuePair<Guid, string>(
                    userId,
                    UserLabelFormatting.ResolveDisplayName(state.DisplayName, userId));
            }))
            .ConfigureAwait(false);

        return results.ToDictionary(pair => pair.Key, pair => pair.Value);
    }
}
