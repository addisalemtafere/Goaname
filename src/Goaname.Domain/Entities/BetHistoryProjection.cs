using Goaname.Domain.Enums;

namespace Goaname.Domain.Entities;

/// <summary>
/// Read-side projection of a bet slip for user history and market activity feeds.
/// Synced from Orleans <see cref="State.BetSlipState"/> via background workers.
/// </summary>
public class BetHistoryProjection
{
    public Guid Id { get; set; }

    public string TenantId { get; set; } = string.Empty;

    public Guid UserId { get; set; }
    public Guid MarketId { get; set; }

    public decimal Amount { get; set; }
    public Outcome SelectedOutcome { get; set; }
    public decimal PotentialPayout { get; set; }

    public BetStatus Status { get; set; }
    public decimal? SettlementAmount { get; set; }

    public DateTimeOffset PlacedAt { get; set; }
    public DateTimeOffset? SettledAt { get; set; }
}
