using Goaname.Contracts.Markets;
using Goaname.Domain.Enums;

namespace Goaname.Grains.Interfaces;

/// <summary>
/// Result of applying a bet to a market's AMM state.
/// </summary>
[GenerateSerializer]
public sealed class PlaceBetResult
{
    [Id(0)] public Outcome Outcome { get; set; }

    [Id(1)] public decimal Amount { get; set; }

    /// <summary>Decimal odds multiplier for the selected outcome at placement time.</summary>
    [Id(2)] public decimal OddsAtPlacement { get; set; }

    /// <summary>Shares received for the bet amount under LMSR.</summary>
    [Id(3)] public decimal SharesReceived { get; set; }

    [Id(4)] public OddsSnapshot UpdatedOdds { get; set; } = new(0.5m, 0.5m, 2m, 2m);
}
