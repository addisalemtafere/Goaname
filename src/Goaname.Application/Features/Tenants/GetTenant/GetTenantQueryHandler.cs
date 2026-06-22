using Goaname.Application.Common;
using Goaname.Contracts.Tenants;
using Goaname.Domain.State;
using Goaname.Grains.Interfaces;
using MediatR;

namespace Goaname.Application.Features.Tenants.GetTenant;

public sealed class GetTenantQueryHandler(IGrainFactory grainFactory)
    : IRequestHandler<GetTenantQuery, TenantDto>
{
    public async Task<TenantDto> Handle(GetTenantQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var tenantGrain = grainFactory.GetGrain<ITenantGrain>(GrainKeys.Tenant(request.TenantId));
        var state = await tenantGrain.GetStateAsync().ConfigureAwait(false);

        return MapToDto(state);
    }

    private static TenantDto MapToDto(TenantState state) =>
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
