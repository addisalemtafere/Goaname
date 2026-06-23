namespace Goaname.Contracts.Activity;

public sealed record ActivityFeedItemDto
{
    public required Guid Id { get; init; }
    public required DateTimeOffset PlacedAt { get; init; }
    public required string TraderLabel { get; init; }
    public required string Kind { get; init; }
    public required string MarketTitle { get; init; }
    public required string Category { get; init; }
    public required decimal Amount { get; init; }
    public decimal? Shares { get; init; }
}

public sealed record ActivityStatsDto
{
    public required decimal Volume24h { get; init; }
    public required int BetsToday { get; init; }
    public required int ActiveMarkets { get; init; }
}

public sealed record ActivityFeedDto
{
    public required ActivityStatsDto Stats { get; init; }
    public required IReadOnlyList<ActivityFeedItemDto> Items { get; init; }
}
