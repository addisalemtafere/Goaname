using Goaname.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Goaname.Infrastructure.Persistence.Configurations;

public class BetHistoryProjectionConfiguration : IEntityTypeConfiguration<BetHistoryProjection>
{
    public void Configure(EntityTypeBuilder<BetHistoryProjection> builder)
    {
        ArgumentNullException.ThrowIfNull(builder);

        builder.ToTable("BetHistory");

        builder.HasKey(b => b.Id);

        builder.Property(b => b.TenantId).IsRequired().HasMaxLength(50);
        builder.Property(b => b.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(b => b.SelectedOutcome).HasConversion<string>().HasMaxLength(10);

        builder.HasIndex(b => new { b.TenantId, b.UserId, b.PlacedAt }).IsDescending(false, false, true);
        builder.HasIndex(b => new { b.TenantId, b.MarketId, b.PlacedAt }).IsDescending(false, false, true);
    }
}
