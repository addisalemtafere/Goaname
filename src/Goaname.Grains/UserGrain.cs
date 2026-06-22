using Goaname.Domain.Enums;
using Goaname.Domain.Exceptions;
using Goaname.Domain.Rules;
using Goaname.Domain.State;
using Goaname.Grains.Interfaces;
using Orleans.Runtime;
using Orleans.Transactions;

namespace Goaname.Grains;

public class UserGrain : Grain, IUserGrain
{
    private readonly IPersistentState<UserState> _state;

    public UserGrain(
        [PersistentState(stateName: "user", storageName: "GoanameStore")]
        IPersistentState<UserState> state)
    {
        _state = state;
    }

    public Task<UserState> GetStateAsync() => Task.FromResult(_state.State);

    public async Task InitializeAsync(Guid userId, string tenantId, string displayName, string email, string currency)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(tenantId);
        ArgumentException.ThrowIfNullOrWhiteSpace(displayName);
        ArgumentException.ThrowIfNullOrWhiteSpace(email);
        ArgumentException.ThrowIfNullOrWhiteSpace(currency);

        if (_state.State.UserId != Guid.Empty)
        {
            _state.State.LastActiveAt = DateTimeOffset.UtcNow;
            await _state.WriteStateAsync().ConfigureAwait(true);
            return;
        }

        var now = DateTimeOffset.UtcNow;
        _state.State.UserId = userId;
        _state.State.TenantId = tenantId;
        _state.State.DisplayName = displayName;
        _state.State.Email = email;
        _state.State.PreferredCurrency = currency;
        _state.State.CreatedAt = now;
        _state.State.LastActiveAt = now;
        _state.State.Wallet = new WalletState
        {
            UserId = userId,
            TenantId = tenantId,
            Currency = currency,
            Status = WalletStatus.Active,
            CreatedAt = now,
            LastUpdated = now,
        };

        await _state.WriteStateAsync().ConfigureAwait(true);
    }

    public async Task UpdatePreferredCurrencyAsync(string currency)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(currency);
        EnsureInitialized();

        _state.State.PreferredCurrency = currency.ToUpperInvariant();
        _state.State.Wallet.Currency = _state.State.PreferredCurrency;
        _state.State.LastActiveAt = DateTimeOffset.UtcNow;
        _state.State.Wallet.LastUpdated = _state.State.LastActiveAt;

        await _state.WriteStateAsync().ConfigureAwait(true);
    }

    public async Task LinkPayoutAccountAsync(string provider, string accountId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(provider);
        ArgumentException.ThrowIfNullOrWhiteSpace(accountId);

        PayoutAccountRules.Validate(provider, accountId);
        EnsureInitialized();

        _state.State.PayoutProvider = PayoutAccountRules.NormalizeProvider(provider);
        _state.State.PayoutAccountId = accountId.Trim();
        _state.State.KycStatus = KycStatus.Pending;
        _state.State.PayoutAccountVerifiedAt = null;
        _state.State.LastActiveAt = DateTimeOffset.UtcNow;

        await _state.WriteStateAsync().ConfigureAwait(true);
    }

    public async Task VerifyPayoutAccountAsync()
    {
        EnsureInitialized();

        if (string.IsNullOrWhiteSpace(_state.State.PayoutAccountId))
        {
            throw new BusinessRuleException("Link a payout account before verification.");
        }

        var now = DateTimeOffset.UtcNow;
        _state.State.KycStatus = KycStatus.Verified;
        _state.State.PayoutAccountVerifiedAt = now;
        _state.State.LastActiveAt = now;

        await _state.WriteStateAsync().ConfigureAwait(true);
    }

    public async Task<WalletState> DepositAsync(decimal amount)
    {
        if (amount <= 0)
        {
            throw new BusinessRuleException("Deposit amount must be greater than zero.");
        }

        EnsureWalletActive();

        var now = DateTimeOffset.UtcNow;
        _state.State.Wallet.Balance += amount;
        _state.State.Wallet.TotalDeposited += amount;
        _state.State.Wallet.LastUpdated = now;
        _state.State.LastActiveAt = now;

        await _state.WriteStateAsync().ConfigureAwait(true);
        return _state.State.Wallet;
    }

    public async Task<WalletState> DebitAsync(decimal amount)
    {
        if (amount <= 0)
        {
            throw new BusinessRuleException("Debit amount must be greater than zero.");
        }

        EnsureWalletActive();

        if (!WalletRules.HasSufficientBalance(_state.State.Wallet, amount))
        {
            throw new BusinessRuleException("Insufficient wallet balance.");
        }

        ApplyDebit(amount);
        await _state.WriteStateAsync().ConfigureAwait(true);
        return _state.State.Wallet;
    }

    [Transaction(TransactionOption.CreateOrJoin)]
    public async Task<WalletState> DebitForBetAsync(decimal amount, Guid betSlipId)
    {
        if (betSlipId == Guid.Empty)
        {
            throw new BusinessRuleException("Bet slip id is required.");
        }

        EnsureWalletActive();

        if (WalletRules.IsMatchingBetDebit(_state.State.Wallet, betSlipId, amount))
        {
            return _state.State.Wallet;
        }

        if (WalletRules.HasConflictingBetDebit(_state.State.Wallet, betSlipId, amount))
        {
            throw new BusinessRuleException("Bet slip debit already recorded with a different amount.");
        }

        if (!WalletRules.HasSufficientBalance(_state.State.Wallet, amount))
        {
            throw new BusinessRuleException("Insufficient wallet balance.");
        }

        ApplyDebit(amount);
        _state.State.Wallet.BetDebitsBySlipId[betSlipId] = amount;

        await _state.WriteStateAsync().ConfigureAwait(true);
        return _state.State.Wallet;
    }

    [Transaction(TransactionOption.CreateOrJoin)]
    public async Task<WalletState> CreditWinningsAsync(decimal amount, Guid betSlipId)
    {
        if (betSlipId == Guid.Empty)
        {
            throw new BusinessRuleException("Bet slip id is required.");
        }

        if (amount < 0)
        {
            throw new BusinessRuleException("Credit amount cannot be negative.");
        }

        EnsureWalletActive();

        if (amount == 0)
        {
            return _state.State.Wallet;
        }

        if (WalletRules.IsMatchingBetCredit(_state.State.Wallet, betSlipId, amount))
        {
            return _state.State.Wallet;
        }

        if (WalletRules.HasConflictingBetCredit(_state.State.Wallet, betSlipId, amount))
        {
            throw new BusinessRuleException("Bet slip credit already recorded with a different amount.");
        }

        var now = DateTimeOffset.UtcNow;
        _state.State.Wallet.Balance += amount;
        _state.State.Wallet.TotalWon += amount;
        _state.State.Wallet.BetCreditsBySlipId[betSlipId] = amount;
        _state.State.Wallet.LastUpdated = now;
        _state.State.LastActiveAt = now;

        await _state.WriteStateAsync().ConfigureAwait(true);
        return _state.State.Wallet;
    }

    private void ApplyDebit(decimal amount)
    {
        var now = DateTimeOffset.UtcNow;
        _state.State.Wallet.Balance -= amount;
        _state.State.Wallet.LastUpdated = now;
        _state.State.LastActiveAt = now;
    }

    private void EnsureInitialized()
    {
        if (_state.State.UserId == Guid.Empty)
        {
            throw new BusinessRuleException("User has not been initialized.");
        }
    }

    private void EnsureWalletActive()
    {
        EnsureInitialized();

        if (!WalletRules.IsActive(_state.State.Wallet))
        {
            throw new BusinessRuleException("Wallet is not active.");
        }
    }
}
