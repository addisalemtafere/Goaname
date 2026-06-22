namespace Goaname.Application.Features.Users;

using Goaname.Contracts.Users;
using Goaname.Domain.Enums;
using Goaname.Domain.State;
using Goaname.Grains.Interfaces;

internal static class UserMappings
{
    public static UserProfileDto ToProfileDto(UserState state, bool withdrawalsEnabled) =>
        new()
        {
            UserId = state.UserId,
            TenantId = state.TenantId,
            DisplayName = state.DisplayName,
            Email = state.Email,
            PreferredCurrency = state.PreferredCurrency,
            KycStatus = state.KycStatus,
            PayoutProvider = state.PayoutProvider,
            PayoutAccountId = state.PayoutAccountId,
            PayoutAccountVerifiedAt = state.PayoutAccountVerifiedAt,
            WithdrawalsEnabled = withdrawalsEnabled && state.KycStatus == KycStatus.Verified,
            LastActiveAt = state.LastActiveAt,
        };

    public static WalletDto ToWalletDto(WalletState wallet) =>
        new()
        {
            UserId = wallet.UserId,
            Currency = wallet.Currency,
            Balance = wallet.Balance,
            TotalDeposited = wallet.TotalDeposited,
            TotalWithdrawn = wallet.TotalWithdrawn,
            TotalWon = wallet.TotalWon,
            TotalLost = wallet.TotalLost,
            Status = wallet.Status,
            LastUpdated = wallet.LastUpdated,
        };
}
