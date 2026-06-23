using Goaname.Domain.Exceptions;
using Goaname.Domain.State;
using Goaname.Grains.Interfaces;
using Orleans.Runtime;

namespace Goaname.Grains;

public class UserCatalogGrain : Grain, IUserCatalogGrain
{
    private readonly IPersistentState<UserCatalogState> _state;

    public UserCatalogGrain(
        [PersistentState(stateName: "usercatalog", storageName: "GoanameStore")]
        IPersistentState<UserCatalogState> state)
    {
        _state = state;
    }

    public async Task RegisterAsync(Guid userId)
    {
        if (userId == Guid.Empty)
        {
            throw new BusinessRuleException("User id is required.");
        }

        if (_state.State.UserIds.Contains(userId))
        {
            return;
        }

        _state.State.UserIds.Add(userId);
        await _state.WriteStateAsync().ConfigureAwait(true);
    }

    public Task<IReadOnlyList<Guid>> GetUserIdsAsync() =>
        Task.FromResult<IReadOnlyList<Guid>>([.. _state.State.UserIds]);
}
