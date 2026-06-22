using Goaname.Domain.Enums;

namespace Goaname.Contracts.Markets;

public sealed record MarketBetSummaryDto
{
    public int TotalBets { get; init; }
    public int UniqueTraders { get; init; }
    public decimal TotalStaked { get; init; }
    public int YesBets { get; init; }
    public int NoBets { get; init; }
    public decimal YesStaked { get; init; }
    public decimal NoStaked { get; init; }
    public int PendingBets { get; init; }
    public int WonBets { get; init; }
    public int LostBets { get; init; }
    public decimal TotalPaidOut { get; init; }
}

public sealed record MarketBetItemDto
{
    public required Guid BetSlipId { get; init; }
    public required Guid UserId { get; init; }
    public required Outcome Outcome { get; init; }
    public required decimal Amount { get; init; }
    public required decimal SharesReceived { get; init; }
    public required decimal OddsAtPlacement { get; init; }
    public required BetStatus Status { get; init; }
    public decimal? SettlementAmount { get; init; }
    public required DateTimeOffset PlacedAt { get; init; }
    public DateTimeOffset? SettledAt { get; init; }
}

public sealed record MarketBetsDto
{
    public required MarketBetSummaryDto Summary { get; init; }
    public required IReadOnlyList<MarketBetItemDto> Bets { get; init; }
}
