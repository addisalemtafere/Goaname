using Orleans.Transactions;

namespace Goaname.Application.Transactions;

public sealed class BetPlacementTransactionRunner(ITransactionClient transactionClient)
    : IBetPlacementTransactionRunner
{
    public async Task<PlaceBetTransactionResult> RunAsync(
        PlaceBetTransactionRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        PlaceBetTransactionResult? result = null;

        await transactionClient.RunTransaction(
            TransactionOption.Create,
            async () =>
            {
                // Orchestration point for ACID bet placement:
                // 1. Validate tenant + market access rules
                // 2. IUserGrain.DebitAsync
                // 3. IMarketGrain.PlaceBetAsync (AMM update)
                // 4. IBetSlipGrain.CreateAsync
                //
                // Implement grain calls here once IUserGrain, IMarketGrain, and IBetSlipGrain are ready.
                await Task.CompletedTask.ConfigureAwait(false);
                result = new PlaceBetTransactionResult(Guid.Empty, 0m, 0m);
            }).ConfigureAwait(false);

        return result ?? throw new InvalidOperationException(
            "Bet placement transaction is configured. Implement grain calls in BetPlacementTransactionRunner.");
    }
}
