using Goaname.Application.Features.Markets;
using Goaname.Contracts.Markets;
using MediatR;

namespace Goaname.Application.Features.Markets.CloseMarket;

public sealed class CloseMarketCommandHandler(IMarketGrainAccessor marketGrainAccessor)
    : IRequestHandler<CloseMarketCommand, MarketDto>
{
    public Task<MarketDto> Handle(CloseMarketCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        return marketGrainAccessor.CloseMarketAsync(request.TenantId, request.MarketId, cancellationToken);
    }
}
