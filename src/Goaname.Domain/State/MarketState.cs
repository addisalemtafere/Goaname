using Goaname.Domain.Enums;
using Orleans;

namespace Goaname.Domain.State;

[GenerateSerializer]
public class MarketState
{
    [Id(0)] public Guid Id { get; set; }
    [Id(1)] public string TenantId { get; set; } = string.Empty;
    [Id(2)] public string Title { get; set; } = string.Empty;
    [Id(3)] public string Category { get; set; } = string.Empty;
    [Id(4)] public MarketStatus Status { get; set; } = MarketStatus.Draft;
    
    // Timestamps
    [Id(5)] public DateTimeOffset CreatedAt { get; set; }
    [Id(6)] public DateTimeOffset TradingEndsAt { get; set; }
    [Id(7)] public DateTimeOffset? ResolutionAt { get; set; }
    [Id(8)] public DateTimeOffset? SettledAt { get; set; }
    
    // AMM State
    [Id(9)] public decimal YesVolume { get; set; }
    [Id(10)] public decimal NoVolume { get; set; }
    [Id(11)] public decimal YesProbability { get; set; }
    [Id(12)] public decimal NoProbability { get; set; }
    [Id(13)] public decimal LiquidityParameter { get; set; } = 1000m; // 'b' in LMSR
    
    // Analytics
    public decimal TotalVolume => YesVolume + NoVolume;
    [Id(15)] public int UniqueTradersCount { get; set; }
    
    // Resolution
    [Id(16)] public Outcome? WinningOutcome { get; set; }
}