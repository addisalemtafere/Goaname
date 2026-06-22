using Goaname.Application.Features.Markets;
using Goaname.Contracts.Markets;
using MediatR;

namespace Goaname.Application.Features.Markets.ListAdminMarkets;

public sealed class ListAdminMarketsQueryHandler(IMarketGrainAccessor marketGrainAccessor)
    : IRequestHandler<ListAdminMarketsQuery, IReadOnlyList<MarketDto>>
{
    public Task<IReadOnlyList<MarketDto>> Handle(ListAdminMarketsQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        return marketGrainAccessor.ListAdminMarketsAsync(request.TenantId, cancellationToken);
    }
}
