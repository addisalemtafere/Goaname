using Goaname.Domain.Enums;
using Goaname.Domain.Rules;

namespace Goaname.Application.Common.Abstractions;

public sealed record BetHistoryRecord(
    Guid BetSlipId,
    string TenantId,
    Guid UserId,
    Guid MarketId,
    string MarketTitle,
    string Category,
    decimal Amount,
    Outcome SelectedOutcome,
    decimal PotentialPayout,
    decimal OddsAtPlacement,
    DateTimeOffset PlacedAt);

public sealed record BetHistoryEntry(
    Guid BetSlipId,
    string TenantId,
    Guid UserId,
    Guid MarketId,
    string MarketTitle,
    string Category,
    decimal Amount,
    Outcome SelectedOutcome,
    decimal PotentialPayout,
    decimal OddsAtPlacement,
    BetStatus Status,
    decimal? SettlementAmount,
    DateTimeOffset PlacedAt,
    DateTimeOffset? SettledAt);

public sealed record BetHistoryStats(decimal Volume24h, int BetsToday);

public interface IBetHistoryRepository
{
    public Task RecordBetAsync(BetHistoryRecord record, CancellationToken cancellationToken = default);

    public Task<IReadOnlyList<BetHistoryEntry>> ListByUserAsync(
        string tenantId,
        Guid userId,
        int limit,
        CancellationToken cancellationToken = default);

    public Task<IReadOnlyList<BetHistoryEntry>> ListByTenantAsync(
        string tenantId,
        int limit,
        CancellationToken cancellationToken = default);

    public Task<BetHistoryStats> GetTenantStatsAsync(
        string tenantId,
        CancellationToken cancellationToken = default);

    public Task<IReadOnlyList<TraderBetSnapshot>> ListLeaderboardBetsAsync(
        string tenantId,
        CancellationToken cancellationToken = default);

    public Task<IReadOnlyList<BetHistoryEntry>> ListByMarketAsync(
        string tenantId,
        Guid marketId,
        BetStatus? status = null,
        CancellationToken cancellationToken = default);

    public Task RecordSettlementAsync(
        Guid betSlipId,
        BetStatus status,
        decimal settlementAmount,
        DateTimeOffset settledAt,
        CancellationToken cancellationToken = default);
}
