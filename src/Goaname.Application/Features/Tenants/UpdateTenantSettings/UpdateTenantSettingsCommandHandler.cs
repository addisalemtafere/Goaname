using Goaname.Application.Common;
using Goaname.Application.Features.Tenants;
using Goaname.Application.Features.Tenants.GetTenant;
using Goaname.Contracts.Admin;
using Goaname.Contracts.Tenants;
using Goaname.Grains.Interfaces;
using MediatR;

namespace Goaname.Application.Features.Tenants.UpdateTenantSettings;

public sealed record UpdateTenantSettingsCommand(string TenantId, UpdateTenantSettingsRequest Settings)
    : ICommand<TenantDto>;

public sealed class UpdateTenantSettingsCommandHandler(IGrainFactory grainFactory, ISender sender)
    : IRequestHandler<UpdateTenantSettingsCommand, TenantDto>
{
    public async Task<TenantDto> Handle(UpdateTenantSettingsCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        ArgumentNullException.ThrowIfNull(request.Settings);

        var tenantGrain = grainFactory.GetGrain<ITenantGrain>(GrainKeys.Tenant(request.TenantId));
        await tenantGrain.UpdateSettingsAsync(new TenantSettingsPatch
        {
            Name = request.Settings.Name,
            OperationalStatus = request.Settings.OperationalStatus,
            BettingEnabled = request.Settings.BettingEnabled,
            DepositsEnabled = request.Settings.DepositsEnabled,
            WithdrawalsEnabled = request.Settings.WithdrawalsEnabled,
            PlatformFeePercent = request.Settings.PlatformFeePercent,
            MaxBetAmount = request.Settings.MaxBetAmount,
            DefaultLiquidityParameter = request.Settings.DefaultLiquidityParameter,
            ThemeKey = request.Settings.ThemeKey,
            SuspensionReason = request.Settings.SuspensionReason,
        }).ConfigureAwait(false);

        return await sender.Send(new GetTenantQuery(request.TenantId), cancellationToken).ConfigureAwait(false);
    }
}
