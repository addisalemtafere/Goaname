using Goaname.Domain.Rules;

namespace Goaname.Application.Transactions;

public sealed record SettleBetRequest(
    string TenantId,
    Guid UserId,
    Guid BetSlipId,
    BetSettlementOutcome Settlement);

public interface ISettlementTransactionRunner
{
    public Task SettleBetAsync(SettleBetRequest request, CancellationToken cancellationToken = default);
}
