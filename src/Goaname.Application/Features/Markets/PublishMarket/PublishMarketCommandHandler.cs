using Goaname.Application.Features.Markets;
using Goaname.Contracts.Markets;
using MediatR;

namespace Goaname.Application.Features.Markets.PublishMarket;

public sealed class PublishMarketCommandHandler(IMarketGrainAccessor marketGrainAccessor)
    : IRequestHandler<PublishMarketCommand, MarketDto>
{
    public Task<MarketDto> Handle(PublishMarketCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        return marketGrainAccessor.PublishMarketAsync(request.TenantId, request.MarketId, cancellationToken);
    }
}
