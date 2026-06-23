using Goaname.Domain.State;

namespace Goaname.Grains.Interfaces;

[Alias("Goaname.Grains.Interfaces.IUserAuthGrain")]
public interface IUserAuthGrain : IGrainWithStringKey
{
    [Alias("GetStateAsync")]
    public Task<UserCredentialsState> GetStateAsync();

    [Alias("RegisterAsync")]
    public Task RegisterAsync(Guid userId, string displayName, string email, string passwordHash);

    [Alias("ValidatePasswordAsync")]
    public Task<bool> ValidatePasswordAsync(string password);
}
