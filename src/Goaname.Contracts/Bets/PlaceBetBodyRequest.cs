using Goaname.Domain.Enums;

namespace Goaname.Contracts.Bets;

public sealed record PlaceBetBodyRequest
{
    public required Outcome Outcome { get; init; }
    public required decimal Amount { get; init; }
}
