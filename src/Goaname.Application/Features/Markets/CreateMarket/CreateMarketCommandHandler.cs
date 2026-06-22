using Goaname.Application.Features.Markets;
using Goaname.Contracts.Markets;
using MediatR;

namespace Goaname.Application.Features.Markets.CreateMarket;

public sealed class CreateMarketCommandHandler(IMarketGrainAccessor marketGrainAccessor)
    : IRequestHandler<CreateMarketCommand, MarketDto>
{
    public Task<MarketDto> Handle(CreateMarketCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        return marketGrainAccessor.CreateMarketAsync(request, cancellationToken);
    }
}
