using Goaname.Grains.Interfaces;
using MediatR;

namespace Goaname.Application.Features.Tenants.RemoveTenantCategory;

public sealed class RemoveTenantCategoryCommandHandler(IGrainFactory grainFactory)
    : IRequestHandler<RemoveTenantCategoryCommand, Unit>
{
    public async Task<Unit> Handle(RemoveTenantCategoryCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        cancellationToken.ThrowIfCancellationRequested();

        await grainFactory
            .GetGrain<ITenantGrain>(GrainKeys.Tenant(request.TenantId))
            .RemoveCategoryAsync(request.Name)
            .ConfigureAwait(false);

        return Unit.Value;
    }
}
