using Goaname.Application.Common.Abstractions;
using Goaname.Application.Transactions;
using Goaname.Domain.Enums;
using Goaname.Domain.Rules;

namespace Goaname.Application.Features.Markets.Settlement;

public sealed class MarketSettlementService(
    IBetHistoryRepository betHistoryRepository,
    ISettlementTransactionRunner settlementTransactionRunner) : IMarketSettlementService
{
    public async Task SettlePendingBetsAsync(
        string tenantId,
        Guid marketId,
        Outcome winningOutcome,
        CancellationToken cancellationToken = default)
    {
        var pendingBets = await betHistoryRepository
            .ListByMarketAsync(tenantId, marketId, BetStatus.Pending, cancellationToken)
            .ConfigureAwait(false);

        foreach (var bet in pendingBets)
        {
            var settlement = BetSettlementRules.Resolve(
                bet.SelectedOutcome,
                winningOutcome,
                bet.PotentialPayout);
            var settledAt = DateTimeOffset.UtcNow;

            await settlementTransactionRunner
                .SettleBetAsync(
                    new SettleBetRequest(tenantId, bet.UserId, bet.BetSlipId, settlement),
                    cancellationToken)
                .ConfigureAwait(false);

            await betHistoryRepository
                .RecordSettlementAsync(bet.BetSlipId, settlement.Status, settlement.Payout, settledAt, cancellationToken)
                .ConfigureAwait(false);
        }
    }
}
