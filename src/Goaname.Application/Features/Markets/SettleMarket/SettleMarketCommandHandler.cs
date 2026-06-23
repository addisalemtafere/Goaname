using Goaname.Application.Features.Markets;
using Goaname.Application.Features.Markets.Settlement;
using Goaname.Contracts.Markets;
using Goaname.Domain.Enums;
using Goaname.Domain.Exceptions;
using Goaname.Domain.Rules;
using MediatR;

namespace Goaname.Application.Features.Markets.SettleMarket;

public sealed class SettleMarketCommandHandler(
    IMarketGrainAccessor marketGrainAccessor,
    IMarketSettlementService marketSettlementService)
    : IRequestHandler<SettleMarketCommand, MarketDto>
{
    public async Task<MarketDto> Handle(SettleMarketCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var market = await marketGrainAccessor
            .GetMarketAsync(request.TenantId, request.MarketId, cancellationToken)
            .ConfigureAwait(false);

        if (market.Status == MarketStatus.Settled)
        {
            return market;
        }

        var failureReason = MarketLifecycleRules.GetSettleFailureReason(market.Status, market.WinningOutcome);
        if (failureReason is not null)
        {
            throw new BusinessRuleException(failureReason);
        }

        await marketSettlementService
            .SettlePendingBetsAsync(
                request.TenantId,
                request.MarketId,
                market.WinningOutcome!.Value,
                cancellationToken)
            .ConfigureAwait(false);

        return await marketGrainAccessor
            .SettleMarketAsync(request.TenantId, request.MarketId, cancellationToken)
            .ConfigureAwait(false);
    }
}
