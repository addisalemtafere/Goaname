using Goaname.Grains.Interfaces;
using Orleans.Transactions;

namespace Goaname.Application.Transactions;

public sealed class SettlementTransactionRunner(
    ITransactionClient transactionClient,
    IGrainFactory grainFactory) : ISettlementTransactionRunner
{
    public async Task SettleBetAsync(SettleBetRequest request, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var settlement = request.Settlement;

        await transactionClient.RunTransaction(
            TransactionOption.Create,
            async () =>
            {
                cancellationToken.ThrowIfCancellationRequested();

                var betSlipGrain = grainFactory.GetGrain<IBetSlipGrain>(
                    GrainKeys.BetSlip(request.TenantId, request.BetSlipId));
                await betSlipGrain.SettleAsync(settlement.Status, settlement.Payout).ConfigureAwait(false);

                if (settlement.Payout > 0)
                {
                    var userGrain = grainFactory.GetGrain<IUserGrain>(
                        GrainKeys.User(request.TenantId, request.UserId));
                    await userGrain.CreditWinningsAsync(settlement.Payout, request.BetSlipId).ConfigureAwait(false);
                }
            }).ConfigureAwait(false);
    }
}
