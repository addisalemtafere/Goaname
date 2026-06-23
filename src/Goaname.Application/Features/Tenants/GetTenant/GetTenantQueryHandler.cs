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

    private static TenantDto MapToDto(TenantState state) => TenantMappings.ToDto(state);
}
