using Goaname.Application.Features.Markets.CreateMarket;
using Goaname.Contracts.Markets;
using Goaname.Domain.Enums;

namespace Goaname.Application.Features.Markets;

public interface IMarketGrainAccessor
{
    public Task<MarketDto> GetMarketAsync(string tenantId, Guid marketId, CancellationToken cancellationToken = default);

    public Task<OddsSnapshot> GetOddsAsync(string tenantId, Guid marketId, CancellationToken cancellationToken = default);

    public Task<MarketDto> CreateMarketAsync(CreateMarketCommand command, CancellationToken cancellationToken = default);

    public Task<MarketDto> PublishMarketAsync(string tenantId, Guid marketId, CancellationToken cancellationToken = default);

    public Task<MarketDto> CloseMarketAsync(string tenantId, Guid marketId, CancellationToken cancellationToken = default);

    public Task<MarketDto> ResolveMarketAsync(
        string tenantId,
        Guid marketId,
        Outcome winningOutcome,
        CancellationToken cancellationToken = default);

    public Task<MarketDto> SettleMarketAsync(string tenantId, Guid marketId, CancellationToken cancellationToken = default);

    public Task<IReadOnlyList<MarketDto>> ListVisibleMarketsAsync(string tenantId, CancellationToken cancellationToken = default);
    public Task<IReadOnlyList<MarketDto>> ListAdminMarketsAsync(string tenantId, CancellationToken cancellationToken = default);
}
