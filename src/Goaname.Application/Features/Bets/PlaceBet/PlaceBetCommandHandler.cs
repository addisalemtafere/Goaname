using Goaname.Application.Transactions;
using Goaname.Contracts.Bets;
using MediatR;

namespace Goaname.Application.Features.Bets.PlaceBet;

public sealed class PlaceBetCommandHandler(IBetPlacementTransactionRunner transactionRunner)
    : IRequestHandler<PlaceBetCommand, PlaceBetResponse>
{
    public async Task<PlaceBetResponse> Handle(PlaceBetCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var result = await transactionRunner.RunAsync(request, cancellationToken).ConfigureAwait(false);

        return new PlaceBetResponse
        {
            BetSlipId = result.BetSlipId,
            OddsAtPlacement = result.OddsAtPlacement,
            SharesReceived = result.SharesReceived,
            UpdatedOdds = result.UpdatedOdds,
            WalletBalance = result.WalletBalance,
            Currency = result.Currency,
        };
    }
}
