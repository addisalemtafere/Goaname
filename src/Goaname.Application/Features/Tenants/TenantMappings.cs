using Goaname.Contracts.Tenants;
using Goaname.Domain.State;

namespace Goaname.Application.Features.Tenants;

internal static class TenantMappings
{
    public static TenantDto ToDto(TenantState state) =>
        new()
        {
            TenantId = state.TenantId,
            Name = state.Name,
            OperationalStatus = state.OperationalStatus,
            BettingEnabled = state.BettingEnabled,
            DepositsEnabled = state.DepositsEnabled,
            WithdrawalsEnabled = state.WithdrawalsEnabled,
            EnabledCategories = state.EnabledCategories.ToList(),
            Currency = state.Currency,
            PlatformFeePercent = state.PlatformFeePercent,
            MaxBetAmount = state.MaxBetAmount,
            DefaultLiquidityParameter = state.DefaultLiquidityParameter,
            ThemeKey = state.ThemeKey,
            SuspensionReason = state.SuspensionReason,
            LastUpdatedAt = state.LastUpdatedAt,
        };
}
