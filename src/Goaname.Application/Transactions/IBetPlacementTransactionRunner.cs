using Goaname.Application.Features.Bets.PlaceBet;
using Goaname.Contracts.Markets;
using Orleans.Transactions;

namespace Goaname.Application.Transactions;

public sealed record PlaceBetTransactionResult(
    Guid BetSlipId,
    decimal OddsAtPlacement,
    decimal SharesReceived,
    OddsSnapshot UpdatedOdds,
    decimal WalletBalance,
    string Currency);

public interface IBetPlacementTransactionRunner
{
    public Task<PlaceBetTransactionResult> RunAsync(
        PlaceBetCommand command,
        CancellationToken cancellationToken = default);
}
