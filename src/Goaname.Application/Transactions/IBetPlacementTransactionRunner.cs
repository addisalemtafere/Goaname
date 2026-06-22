using Goaname.Domain.Enums;

namespace Goaname.Application.Transactions;

public sealed record PlaceBetTransactionRequest(
    string TenantId,
    Guid UserId,
    Guid MarketId,
    Outcome Outcome,
    decimal Amount);

public sealed record PlaceBetTransactionResult(
    Guid BetSlipId,
    decimal OddsAtPlacement,
    decimal SharesReceived);

public interface IBetPlacementTransactionRunner
{
    public Task<PlaceBetTransactionResult> RunAsync(
        PlaceBetTransactionRequest request,
        CancellationToken cancellationToken = default);
}
