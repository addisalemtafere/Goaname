using Goaname.Application.Features.Markets;
using Goaname.Contracts.Markets;
using MediatR;

namespace Goaname.Application.Features.Markets.ListMarkets;

public sealed class ListMarketsQueryHandler(IMarketGrainAccessor marketGrainAccessor)
    : IRequestHandler<ListMarketsQuery, IReadOnlyList<MarketDto>>
{
    public Task<IReadOnlyList<MarketDto>> Handle(ListMarketsQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        return marketGrainAccessor.ListVisibleMarketsAsync(request.TenantId, cancellationToken);
    }
}
