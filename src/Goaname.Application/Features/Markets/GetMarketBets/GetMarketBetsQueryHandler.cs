using Goaname.Application.Common.Abstractions;
using Goaname.Contracts.Markets;
using MediatR;

namespace Goaname.Application.Features.Markets.GetMarketBets;

public sealed class GetMarketBetsQueryHandler(IBetHistoryRepository betHistoryRepository)
    : IRequestHandler<GetMarketBetsQuery, MarketBetsDto>
{
    public async Task<MarketBetsDto> Handle(GetMarketBetsQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var entries = await betHistoryRepository
            .ListByMarketAsync(request.TenantId, request.MarketId, cancellationToken: cancellationToken)
            .ConfigureAwait(false);

        return MarketBetMappings.ToDto(entries);
    }
}
