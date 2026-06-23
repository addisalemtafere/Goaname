using Goaname.Domain.Enums;

namespace Goaname.Contracts.Markets;

public sealed record MarketDto
{
    public required Guid Id { get; init; }
    public required string TenantId { get; init; }
    public required string Title { get; init; }
    public required string Category { get; init; }
    public MarketStatus Status { get; init; }
    public DateTimeOffset TradingEndsAt { get; init; }
    public decimal YesProbability { get; init; }
    public decimal NoProbability { get; init; }
    public decimal YesMultiplier { get; init; }
    public decimal NoMultiplier { get; init; }
    public decimal TotalVolume { get; init; }
    public int UniqueTraders { get; init; }
    public bool IsVisible { get; init; }
    public Outcome? WinningOutcome { get; init; }
}
