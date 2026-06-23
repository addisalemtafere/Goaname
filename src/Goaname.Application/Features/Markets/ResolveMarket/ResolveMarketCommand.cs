using Goaname.Application.Common;
using Goaname.Contracts.Markets;
using Goaname.Domain.Enums;

namespace Goaname.Application.Features.Markets.ResolveMarket;

public sealed record ResolveMarketCommand(string TenantId, Guid MarketId, Outcome WinningOutcome)
    : ICommand<MarketDto>
{
    public static ResolveMarketCommand FromRequest(
        string tenantId,
        Guid marketId,
        ResolveMarketRequest request)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(tenantId);
        ArgumentNullException.ThrowIfNull(request);
        return new ResolveMarketCommand(tenantId.Trim(), marketId, request.WinningOutcome);
    }
}
