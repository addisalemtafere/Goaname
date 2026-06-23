using Goaname.Grains.Interfaces;
using MediatR;

namespace Goaname.Application.Features.Tenants.AddTenantCategory;

public sealed class AddTenantCategoryCommandHandler(IGrainFactory grainFactory)
    : IRequestHandler<AddTenantCategoryCommand, Unit>
{
    public async Task<Unit> Handle(AddTenantCategoryCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        cancellationToken.ThrowIfCancellationRequested();

        await grainFactory
            .GetGrain<ITenantGrain>(GrainKeys.Tenant(request.TenantId))
            .AddCategoryAsync(request.Name)
            .ConfigureAwait(false);

        return Unit.Value;
    }
}
