using Goaname.Domain.Enums;

namespace Goaname.Application.Features.Markets.Settlement;

public interface IMarketSettlementService
{
    public Task SettlePendingBetsAsync(
        string tenantId,
        Guid marketId,
        Outcome winningOutcome,
        CancellationToken cancellationToken = default);
}
