using Goaname.Application.Common.Abstractions;
using Goaname.Application.Features.Leaderboard;
using Goaname.Application.Features.Users;
using Goaname.Contracts.Leaderboard;
using Goaname.Domain.Rules;
using MediatR;

namespace Goaname.Application.Features.Leaderboard.GetLeaderboard;

public sealed class GetLeaderboardQueryHandler(
    IBetHistoryRepository betHistoryRepository,
    IUserDisplayNameResolver userDisplayNameResolver)
    : IRequestHandler<GetLeaderboardQuery, LeaderboardDto>
{
    public async Task<LeaderboardDto> Handle(GetLeaderboardQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var bets = await betHistoryRepository
            .ListLeaderboardBetsAsync(request.TenantId, cancellationToken)
            .ConfigureAwait(false);

        var result = LeaderboardRules.Build(bets, request.Limit, DateTimeOffset.UtcNow);
        var displayNames = await userDisplayNameResolver
            .ResolveAsync(
                request.TenantId,
                result.RankedTraders.Select(metrics => metrics.UserId),
                cancellationToken)
            .ConfigureAwait(false);

        return LeaderboardMappings.ToDto(result, displayNames);
    }
}
