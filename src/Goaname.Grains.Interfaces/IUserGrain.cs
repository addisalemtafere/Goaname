using Goaname.Domain.State;

namespace Goaname.Grains.Interfaces;

[Alias("Goaname.Grains.Interfaces.IUserGrain")]
public interface IUserGrain : IGrainWithStringKey
{
    [Alias("GetStateAsync")]
    public Task<UserState> GetStateAsync();

    [Alias("InitializeAsync")]
    public Task InitializeAsync(Guid userId, string tenantId, string displayName, string email, string currency);

    [Alias("UpdatePreferredCurrencyAsync")]
    public Task UpdatePreferredCurrencyAsync(string currency);

    [Alias("LinkPayoutAccountAsync")]
    public Task LinkPayoutAccountAsync(string provider, string accountId);

    [Alias("VerifyPayoutAccountAsync")]
    public Task VerifyPayoutAccountAsync();

    [Alias("DepositAsync")]
    public Task<WalletState> DepositAsync(decimal amount);

    [Alias("DebitAsync")]
    public Task<WalletState> DebitAsync(decimal amount);

    /// <summary>
    /// Debits wallet for a bet slip. Idempotent for the same <paramref name="betSlipId"/>.
    /// </summary>
    [Alias("DebitForBetAsync")]
    public Task<WalletState> DebitForBetAsync(decimal amount, Guid betSlipId);
}
