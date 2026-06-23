using Goaname.Application.Common;
using Goaname.Contracts.Bets;
using Goaname.Domain.Enums;

namespace Goaname.Application.Features.Bets.PlaceBet;

public sealed record PlaceBetCommand(
    string TenantId,
    Guid UserId,
    Guid MarketId,
    Outcome Outcome,
    decimal Amount) : ICommand<PlaceBetResponse>
{
    public static PlaceBetCommand FromRequest(
        string tenantId,
        Guid userId,
        Guid marketId,
        PlaceBetBodyRequest request)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(tenantId);
        ArgumentNullException.ThrowIfNull(request);

        return new PlaceBetCommand(
            tenantId.Trim(),
            userId,
            marketId,
            request.Outcome,
            request.Amount);
    }
}
