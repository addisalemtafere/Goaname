using Goaname.Application.Common.Abstractions;
using Goaname.Domain.Entities;
using Goaname.Domain.Enums;
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
            row.PlacedAt);

    private static DateTimeOffset EnsureUtc(DateTimeOffset value) =>
        value.Offset == TimeSpan.Zero ? value : value.ToUniversalTime();

    private static DateTimeOffset StartOfUtcDay(DateTimeOffset utcNow) =>
        new(utcNow.UtcDateTime.Date, TimeSpan.Zero);
}
