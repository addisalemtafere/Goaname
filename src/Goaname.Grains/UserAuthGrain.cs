using Goaname.Domain.Exceptions;
using Goaname.Domain.State;
using Goaname.Grains.Interfaces;
using Orleans.Runtime;

namespace Goaname.Grains;

public class UserAuthGrain : Grain, IUserAuthGrain
{
    private readonly IPersistentState<UserCredentialsState> _state;

    public UserAuthGrain(
        [PersistentState(stateName: "credentials", storageName: "GoanameStore")]
        IPersistentState<UserCredentialsState> state)
    {
        _state = state;
    }

    public Task<UserCredentialsState> GetStateAsync() => Task.FromResult(_state.State);

    public async Task RegisterAsync(Guid userId, string displayName, string email, string passwordHash)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(displayName);
        ArgumentException.ThrowIfNullOrWhiteSpace(email);
        ArgumentException.ThrowIfNullOrWhiteSpace(passwordHash);

        if (!string.IsNullOrEmpty(_state.State.Email))
        {
            throw new BusinessRuleException("An account with this email already exists.");
        }

        var tenantId = ExtractTenantId(this.GetPrimaryKeyString());

        _state.State.UserId = userId;
        _state.State.TenantId = tenantId;
        _state.State.DisplayName = displayName.Trim();
        _state.State.Email = email.Trim().ToUpperInvariant();
        _state.State.PasswordHash = passwordHash;
        _state.State.CreatedAt = DateTimeOffset.UtcNow;

        await _state.WriteStateAsync().ConfigureAwait(true);
    }

    public Task<bool> ValidatePasswordAsync(string password)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(password);

        if (string.IsNullOrEmpty(_state.State.Email))
        {
            return Task.FromResult(false);
        }

        return Task.FromResult(Domain.Auth.PasswordHasher.Verify(password, _state.State.PasswordHash));
    }

    private static string ExtractTenantId(string grainKey)
    {
        const string separator = "_auth_";
        var separatorIndex = grainKey.IndexOf(separator, StringComparison.Ordinal);
        return separatorIndex > 0 ? grainKey[..separatorIndex] : grainKey.Split('_')[0];
    }
}
