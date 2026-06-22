using Goaname.Grains.Interfaces;
using MediatR;

namespace Goaname.Application.Features.Tenants.UpdateTenantBetting;

public sealed class UpdateTenantBettingCommandHandler(IGrainFactory grainFactory)
    : IRequestHandler<UpdateTenantBettingCommand, Unit>
{
    public async Task<Unit> Handle(UpdateTenantBettingCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var tenantGrain = grainFactory.GetGrain<ITenantGrain>(GrainKeys.Tenant(request.TenantId));
        await tenantGrain.UpdateBettingEnabledAsync(request.Enabled).ConfigureAwait(false);

        return Unit.Value;
    }
}
