using Goaname.Application.Features.Markets;
using Goaname.Contracts.Markets;
using MediatR;

namespace Goaname.Application.Features.Markets.ResolveMarket;

public sealed class ResolveMarketCommandHandler(IMarketGrainAccessor marketGrainAccessor)
    : IRequestHandler<ResolveMarketCommand, MarketDto>
{
    public Task<MarketDto> Handle(ResolveMarketCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        return marketGrainAccessor.ResolveMarketAsync(
            request.TenantId,
            request.MarketId,
            request.WinningOutcome,
            cancellationToken);
    }
}
