using Goaname.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Goaname.Infrastructure.Persistence.Configurations;

public class MarketProjectionConfiguration : IEntityTypeConfiguration<MarketProjection>
{
    public void Configure(EntityTypeBuilder<MarketProjection> builder)
    {
        ArgumentNullException.ThrowIfNull(builder);

        builder.ToTable("Markets");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.TenantId).IsRequired().HasMaxLength(50);
        builder.Property(m => m.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(m => m.DataPayload).HasColumnType("jsonb");

        builder.HasIndex(m => m.TenantId);
        builder.HasIndex(m => new { m.TenantId, m.Status, m.TotalVolume }).IsDescending(false, false, true);
        builder.HasIndex(m => new { m.TenantId, m.Status, m.TradingEndsAt });
    }
}
