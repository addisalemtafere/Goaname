namespace Goaname.Contracts.Leaderboard;

public sealed record LeaderboardStatsDto
{
    public int ActiveTraders { get; init; }
    public decimal WeeklyVolume { get; init; }
    public int TopWinRate { get; init; }
}

public sealed record LeaderboardEntryDto
{
    public required int Rank { get; init; }
    public required Guid UserId { get; init; }
    public required string DisplayName { get; init; }
    public required decimal Pnl { get; init; }
    public required int WinRate { get; init; }
    public required decimal Volume { get; init; }
    public required int Trades { get; init; }
}

public sealed record LeaderboardDto
{
    public required LeaderboardStatsDto Stats { get; init; }
    public required IReadOnlyList<LeaderboardEntryDto> Entries { get; init; }
}
