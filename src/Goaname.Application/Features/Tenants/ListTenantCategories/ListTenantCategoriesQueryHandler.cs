using Goaname.Grains.Interfaces;
using MediatR;

namespace Goaname.Application.Features.Tenants.ListTenantCategories;

public sealed class ListTenantCategoriesQueryHandler(IGrainFactory grainFactory)
    : IRequestHandler<ListTenantCategoriesQuery, IReadOnlyList<string>>
{
    public Task<IReadOnlyList<string>> Handle(ListTenantCategoriesQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        cancellationToken.ThrowIfCancellationRequested();

        return grainFactory
            .GetGrain<ITenantGrain>(GrainKeys.Tenant(request.TenantId))
            .GetCategoriesAsync();
    }
}
