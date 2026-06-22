using Goaname.Domain.Enums;

namespace Goaname.Contracts.Bets;

public sealed record BetHistoryItemDto
{
    public required Guid BetSlipId { get; init; }
    public required Guid MarketId { get; init; }
    public required string MarketTitle { get; init; }
    public required string Category { get; init; }
    public required Outcome Outcome { get; init; }
    public required decimal Amount { get; init; }
    public required decimal SharesReceived { get; init; }
    public required decimal OddsAtPlacement { get; init; }
    public required BetStatus Status { get; init; }
    public required DateTimeOffset PlacedAt { get; init; }
}
