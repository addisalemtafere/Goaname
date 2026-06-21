using Goaname.Domain.Enums;

namespace Goaname.Domain.Entities;

/// <summary>
/// Read-side projection of a market, optimized for API listing and filtering.
/// Synced from Orleans <see cref="State.MarketState"/> via background workers.
/// </summary>
public class MarketProjection
{
    public Guid Id { get; set; }

    public string TenantId { get; set; } = string.Empty;

    public MarketStatus Status { get; set; }
    public DateTimeOffset TradingEndsAt { get; set; }
    public decimal TotalVolume { get; set; }
    public int UniqueTraders { get; set; }
    public bool IsPinned { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsVisible { get; set; }
    public bool YesBettingEnabled { get; set; } = true;
    public bool NoBettingEnabled { get; set; } = true;

    /// <summary>
    /// JSON payload for UI fields (title, image, category, odds display, etc.).
    /// </summary>
    public string DataPayload { get; set; } = string.Empty;

    public DateTimeOffset LastUpdatedAt { get; set; }
    public long Version { get; set; }
}
