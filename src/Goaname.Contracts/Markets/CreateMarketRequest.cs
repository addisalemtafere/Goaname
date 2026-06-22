namespace Goaname.Contracts.Markets;

public sealed record CreateMarketRequest
{
    public required string Title { get; init; }
    public required string Category { get; init; }
    public DateTimeOffset TradingEndsAt { get; init; }
    public decimal? LiquidityParameter { get; init; }
}
