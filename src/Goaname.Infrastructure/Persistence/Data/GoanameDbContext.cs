using Goaname.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Goaname.Infrastructure.Persistence.Data;

public class GoanameDbContext : DbContext
{
    public GoanameDbContext(DbContextOptions<GoanameDbContext> options) : base(options)
    {
        ChangeTracker.QueryTrackingBehavior = QueryTrackingBehavior.NoTracking;
        ChangeTracker.LazyLoadingEnabled = false;
        ChangeTracker.AutoDetectChangesEnabled = false;
    }

    public DbSet<MarketProjection> Markets => Set<MarketProjection>();
    public DbSet<BetHistoryProjection> BetHistory => Set<BetHistoryProjection>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        ArgumentNullException.ThrowIfNull(modelBuilder);

        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(GoanameDbContext).Assembly);
    }
}
