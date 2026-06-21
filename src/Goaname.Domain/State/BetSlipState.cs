using Goaname.Domain.Enums;
using Orleans;

namespace Goaname.Domain.State;

[GenerateSerializer]
public class BetSlipState
{
    [Id(0)] public Guid Id { get; set; }
    [Id(1)] public Guid UserId { get; set; }
    [Id(2)] public Guid MarketId { get; set; }
    [Id(3)] public string TenantId { get; set; } = string.Empty;
    
    // Bet Details
    [Id(4)] public decimal Amount { get; set; }
    [Id(5)] public Outcome SelectedOutcome { get; set; }
    [Id(6)] public decimal SharesReceived { get; set; } // Potential payout
    [Id(7)] public decimal OddsAtPlacement { get; set; }
    
    // Status
    [Id(8)] public BetStatus Status { get; set; } = BetStatus.Pending;
    [Id(9)] public decimal? SettlementAmount { get; set; }
    
    // Timestamps
    [Id(10)] public DateTimeOffset PlacedAt { get; set; }
    [Id(11)] public DateTimeOffset? SettledAt { get; set; }
}