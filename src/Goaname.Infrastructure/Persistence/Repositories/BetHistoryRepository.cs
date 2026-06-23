using Goaname.Application.Common.Abstractions;
using Goaname.Domain.Entities;
using Goaname.Domain.Enums;
using Goaname.Domain.Rules;
using Goaname.Infrastructure.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace Goaname.Infrastructure.Persistence.Repositories;

public sealed class BetHistoryRepository(GoanameDbContext dbContext) : IBetHistoryRepository
{
    public async Task RecordBetAsync(BetHistoryRecord record, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(record);

        var exists = await dbContext.BetHistory
            .AnyAsync(b => b.Id == record.BetSlipId, cancellationToken)
            .ConfigureAwait(false);

        if (exists)
        {
            return;
        }

        dbContext.BetHistory.Add(ToProjection(record));
        await dbContext.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
    }

    public Task<IReadOnlyList<BetHistoryEntry>> ListByUserAsync(
        string tenantId,
        Guid userId,
        int limit,
        CancellationToken cancellationToken = default) =>
        ListAsync(
            query => query.Where(b => b.TenantId == tenantId && b.UserId == userId),
            limit,
            cancellationToken);

    public Task<IReadOnlyList<BetHistoryEntry>> ListByTenantAsync(
        string tenantId,
        int limit,
        CancellationToken cancellationToken = default) =>
        ListAsync(
            query => query.Where(b => b.TenantId == tenantId),
            limit,
            cancellationToken);

    public async Task<BetHistoryStats> GetTenantStatsAsync(
        string tenantId,
        CancellationToken cancellationToken = default)
    {
        var utcNow = DateTimeOffset.UtcNow;
        var dayAgo = utcNow.AddHours(-24);
        var todayStart = StartOfUtcDay(utcNow);

        var volume24h = await dbContext.BetHistory
            .AsNoTracking()
            .Where(b => b.TenantId == tenantId && b.PlacedAt >= dayAgo)
            .SumAsync(b => b.Amount, cancellationToken)
            .ConfigureAwait(false);

        var betsToday = await dbContext.BetHistory
            .AsNoTracking()
            .CountAsync(b => b.TenantId == tenantId && b.PlacedAt >= todayStart, cancellationToken)
            .ConfigureAwait(false);

        return new BetHistoryStats(volume24h, betsToday);
    }

    public async Task<IReadOnlyList<TraderBetSnapshot>> ListLeaderboardBetsAsync(
        string tenantId,
        CancellationToken cancellationToken = default)
    {
        var rows = await dbContext.BetHistory
            .AsNoTracking()
            .Where(b => b.TenantId == tenantId)
            .Select(b => new TraderBetSnapshot(
                b.UserId,
                b.Amount,
                b.Status,
                b.SettlementAmount,
                b.PlacedAt))
            .ToListAsync(cancellationToken)
            .ConfigureAwait(false);

        return rows;
    }

    public async Task<IReadOnlyList<BetHistoryEntry>> ListByMarketAsync(
        string tenantId,
        Guid marketId,
        BetStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.BetHistory
            .AsNoTracking()
            .Where(b => b.TenantId == tenantId && b.MarketId == marketId);

        if (status.HasValue)
        {
            query = query.Where(b => b.Status == status.Value);
        }

        query = status == BetStatus.Pending
            ? query.OrderBy(b => b.PlacedAt)
            : query.OrderByDescending(b => b.PlacedAt);

        var rows = await query.ToListAsync(cancellationToken).ConfigureAwait(false);
        return rows.Select(ToEntry).ToList();
    }

    public async Task RecordSettlementAsync(
        Guid betSlipId,
        BetStatus status,
        decimal settlementAmount,
        DateTimeOffset settledAt,
        CancellationToken cancellationToken = default)
    {
        var utcSettledAt = EnsureUtc(settledAt);

        var updated = await dbContext.BetHistory
            .Where(b => b.Id == betSlipId && b.Status == BetStatus.Pending)
            .ExecuteUpdateAsync(
                setters => setters
                    .SetProperty(b => b.Status, status)
                    .SetProperty(b => b.SettlementAmount, settlementAmount)
                    .SetProperty(b => b.SettledAt, utcSettledAt),
                cancellationToken)
            .ConfigureAwait(false);

        if (updated > 0)
        {
            return;
        }

        var existing = await dbContext.BetHistory
            .AsNoTracking()
            .Where(b => b.Id == betSlipId)
            .Select(b => new { b.Status, b.SettlementAmount })
            .FirstOrDefaultAsync(cancellationToken)
            .ConfigureAwait(false);

        if (existing is null)
        {
            return;
        }

        if (existing.Status == status && existing.SettlementAmount == settlementAmount)
        {
            return;
        }

        throw new InvalidOperationException($"Bet slip {betSlipId} is already settled.");
    }

    private async Task<IReadOnlyList<BetHistoryEntry>> ListAsync(
        Func<IQueryable<BetHistoryProjection>, IQueryable<BetHistoryProjection>> filter,
        int limit,
        CancellationToken cancellationToken)
    {
        var rows = await filter(dbContext.BetHistory.AsNoTracking())
            .OrderByDescending(b => b.PlacedAt)
            .Take(limit)
            .ToListAsync(cancellationToken)
            .ConfigureAwait(false);

        return rows.Select(ToEntry).ToList();
    }

    private static BetHistoryProjection ToProjection(BetHistoryRecord record) =>
        new()
        {
            Id = record.BetSlipId,
            TenantId = record.TenantId,
            UserId = record.UserId,
            MarketId = record.MarketId,
            MarketTitle = record.MarketTitle,
            Category = record.Category,
            Amount = record.Amount,
            SelectedOutcome = record.SelectedOutcome,
            PotentialPayout = record.PotentialPayout,
            OddsAtPlacement = record.OddsAtPlacement,
            Status = BetStatus.Pending,
            PlacedAt = EnsureUtc(record.PlacedAt),
        };

    private static BetHistoryEntry ToEntry(BetHistoryProjection row) =>
        new(
            row.Id,
            row.TenantId,
            row.UserId,
            row.MarketId,
            row.MarketTitle,
            row.Category,
            row.Amount,
            row.SelectedOutcome,
            row.PotentialPayout,
            row.OddsAtPlacement,
            row.Status,
            row.SettlementAmount,
            row.PlacedAt,
            row.SettledAt);

    private static DateTimeOffset EnsureUtc(DateTimeOffset value) =>
        value.Offset == TimeSpan.Zero ? value : value.ToUniversalTime();

    private static DateTimeOffset StartOfUtcDay(DateTimeOffset utcNow) =>
        new(utcNow.UtcDateTime.Date, TimeSpan.Zero);
}
