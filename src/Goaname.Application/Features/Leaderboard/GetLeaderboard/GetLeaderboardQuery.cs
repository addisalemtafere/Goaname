using Goaname.Application.Common;
using Goaname.Contracts.Leaderboard;

namespace Goaname.Application.Features.Leaderboard.GetLeaderboard;

public sealed record GetLeaderboardQuery(string TenantId, int Limit = 25)
    : IQuery<LeaderboardDto>;
