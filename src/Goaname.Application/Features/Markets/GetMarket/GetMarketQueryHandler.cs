using Goaname.Application.Features.Markets;
using Goaname.Contracts.Markets;
using MediatR;

namespace Goaname.Application.Features.Markets.GetMarket;

public sealed class GetMarketQueryHandler(IMarketGrainAccessor marketGrainAccessor)
    : IRequestHandler<GetMarketQuery, MarketDto>
{
    public Task<MarketDto> Handle(GetMarketQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        return marketGrainAccessor.GetMarketAsync(request.TenantId, request.MarketId, cancellationToken);
    }
}
