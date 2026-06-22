using Goaname.Contracts.Markets;

namespace Goaname.Contracts.Bets;

public sealed record PlaceBetResponse
{
    public required Guid BetSlipId { get; init; }
    public required decimal OddsAtPlacement { get; init; }
    public required decimal SharesReceived { get; init; }
    public required OddsSnapshot UpdatedOdds { get; init; }
    public required decimal WalletBalance { get; init; }
    public required string Currency { get; init; }
}
