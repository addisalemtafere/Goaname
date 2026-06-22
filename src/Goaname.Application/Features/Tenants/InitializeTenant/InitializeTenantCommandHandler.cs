using Goaname.Application.Features.Tenants.GetTenant;
using Goaname.Contracts.Tenants;
using Goaname.Grains.Interfaces;
using MediatR;

namespace Goaname.Application.Features.Tenants.InitializeTenant;

public sealed class InitializeTenantCommandHandler(IGrainFactory grainFactory, ISender sender)
    : IRequestHandler<InitializeTenantCommand, TenantDto>
{
    public async Task<TenantDto> Handle(InitializeTenantCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var tenantGrain = grainFactory.GetGrain<ITenantGrain>(GrainKeys.Tenant(request.TenantId));
        await tenantGrain.InitializeAsync(request.Name, request.Currency).ConfigureAwait(false);

        return await sender.Send(new GetTenantQuery(request.TenantId), cancellationToken).ConfigureAwait(false);
    }
}
