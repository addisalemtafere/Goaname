using Goaname.Application.Features.Bets.PlaceBet;
using Goaname.Domain.State;
using Goaname.Grains.Interfaces;
using Orleans.Transactions;

namespace Goaname.Application.Transactions;

public sealed class BetPlacementTransactionRunner(
    ITransactionClient transactionClient,
    IGrainFactory grainFactory) : IBetPlacementTransactionRunner
{
    public async Task<PlaceBetTransactionResult> RunAsync(
        PlaceBetCommand command,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(command);

        var betSlipId = Guid.NewGuid();
        PlaceBetTransactionResult? result = null;

        await transactionClient.RunTransaction(
            TransactionOption.Create,
            async () =>
            {
                cancellationToken.ThrowIfCancellationRequested();

                var wallet = await DebitWalletAsync(command, betSlipId).ConfigureAwait(false);
                var placeBetResult = await PlaceMarketBetAsync(command).ConfigureAwait(false);
                await CreateBetSlipAsync(command, betSlipId, placeBetResult).ConfigureAwait(false);

                result = new PlaceBetTransactionResult(
                    betSlipId,
                    placeBetResult.OddsAtPlacement,
                    placeBetResult.SharesReceived,
                    placeBetResult.UpdatedOdds,
                    wallet.Balance,
                    wallet.Currency);
            }).ConfigureAwait(false);

        return result ?? throw new InvalidOperationException("Bet placement transaction did not produce a result.");
    }

    private Task<WalletState> DebitWalletAsync(PlaceBetCommand command, Guid betSlipId)
    {
        var grain = grainFactory.GetGrain<IUserGrain>(GrainKeys.User(command.TenantId, command.UserId));
        return grain.DebitForBetAsync(command.Amount, betSlipId);
    }

    private Task<PlaceBetResult> PlaceMarketBetAsync(PlaceBetCommand command)
    {
        var grain = grainFactory.GetGrain<IMarketGrain>(GrainKeys.Market(command.TenantId, command.MarketId));
        return grain.PlaceBetAsync(command.UserId, command.Outcome, command.Amount);
    }

    private Task CreateBetSlipAsync(PlaceBetCommand command, Guid betSlipId, PlaceBetResult placeBetResult)
    {
        var grain = grainFactory.GetGrain<IBetSlipGrain>(GrainKeys.BetSlip(command.TenantId, betSlipId));
        return grain.CreateAsync(
            command.TenantId,
            command.UserId,
            command.MarketId,
            command.Outcome,
            command.Amount,
            placeBetResult.OddsAtPlacement,
            placeBetResult.SharesReceived);
    }
}
