using Goaname.Application.Common.Abstractions;
using Goaname.Application.Features.Markets;
using Goaname.Contracts.Activity;
using MediatR;

namespace Goaname.Application.Features.Activity.ListActivity;

public sealed class ListActivityQueryHandler(
    IBetHistoryRepository betHistoryRepository,
    IMarketGrainAccessor marketGrainAccessor)
    : IRequestHandler<ListActivityQuery, ActivityFeedDto>
{
    public async Task<ActivityFeedDto> Handle(ListActivityQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var marketsTask = marketGrainAccessor.ListVisibleMarketsAsync(request.TenantId, cancellationToken);

        // DbContext is scoped and not thread-safe — query EF sequentially.
        var entries = await betHistoryRepository
            .ListByTenantAsync(request.TenantId, request.Limit, cancellationToken)
            .ConfigureAwait(false);
        var stats = await betHistoryRepository
            .GetTenantStatsAsync(request.TenantId, cancellationToken)
            .ConfigureAwait(false);
        var markets = await marketsTask.ConfigureAwait(false);

        return new ActivityFeedDto
        {
            Stats = new ActivityStatsDto
            {
                Volume24h = stats.Volume24h,
                BetsToday = stats.BetsToday,
                ActiveMarkets = markets.Count,
            },
            Items = entries.Select(ActivityMappings.ToFeedItem).ToList(),
        };
    }
}
