using Goaname.Domain.Enums;
using Goaname.Domain.State;

namespace Goaname.Domain.Rules;

/// <summary>
/// Pure wallet business rules. Grains enforce outcomes via exceptions.
/// </summary>
public static class WalletRules
{
    public static bool IsActive(WalletState wallet)
    {
        ArgumentNullException.ThrowIfNull(wallet);
        return wallet.Status == WalletStatus.Active;
    }

    public static bool HasSufficientBalance(WalletState wallet, decimal amount)
    {
        ArgumentNullException.ThrowIfNull(wallet);
        return wallet.Balance >= amount;
    }

    public static bool TryGetBetDebitAmount(WalletState wallet, Guid betSlipId, out decimal amount)
    {
        ArgumentNullException.ThrowIfNull(wallet);
        return wallet.BetDebitsBySlipId.TryGetValue(betSlipId, out amount);
    }

    public static bool IsMatchingBetDebit(WalletState wallet, Guid betSlipId, decimal amount)
    {
        ArgumentNullException.ThrowIfNull(wallet);
        return TryGetBetDebitAmount(wallet, betSlipId, out var existingAmount) && existingAmount == amount;
    }

    public static bool HasConflictingBetDebit(WalletState wallet, Guid betSlipId, decimal amount)
    {
        ArgumentNullException.ThrowIfNull(wallet);
        return TryGetBetDebitAmount(wallet, betSlipId, out var existingAmount) && existingAmount != amount;
    }

    public static bool TryGetBetCreditAmount(WalletState wallet, Guid betSlipId, out decimal amount)
    {
        ArgumentNullException.ThrowIfNull(wallet);
        return wallet.BetCreditsBySlipId.TryGetValue(betSlipId, out amount);
    }

    public static bool IsMatchingBetCredit(WalletState wallet, Guid betSlipId, decimal amount)
    {
        ArgumentNullException.ThrowIfNull(wallet);
        return TryGetBetCreditAmount(wallet, betSlipId, out var existingAmount) && existingAmount == amount;
    }

    public static bool HasConflictingBetCredit(WalletState wallet, Guid betSlipId, decimal amount)
    {
        ArgumentNullException.ThrowIfNull(wallet);
        return TryGetBetCreditAmount(wallet, betSlipId, out var existingAmount) && existingAmount != amount;
    }
}
