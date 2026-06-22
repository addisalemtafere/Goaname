using Goaname.Domain.Enums;

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
    DateTimeOffset PlacedAt);

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
}
