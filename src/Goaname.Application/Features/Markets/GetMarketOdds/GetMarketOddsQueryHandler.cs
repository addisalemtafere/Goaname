using Goaname.Application.Features.Markets;
using Goaname.Contracts.Markets;
using MediatR;

namespace Goaname.Application.Features.Markets.GetMarketOdds;

public sealed class GetMarketOddsQueryHandler(IMarketGrainAccessor marketGrainAccessor)
    : IRequestHandler<GetMarketOddsQuery, OddsSnapshot>
{
    public Task<OddsSnapshot> Handle(GetMarketOddsQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        return marketGrainAccessor.GetOddsAsync(request.TenantId, request.MarketId, cancellationToken);
    }
}
