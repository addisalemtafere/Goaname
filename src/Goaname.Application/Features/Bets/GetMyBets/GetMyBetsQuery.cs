using Goaname.Application.Common;
using Goaname.Contracts.Bets;

namespace Goaname.Application.Features.Bets.GetMyBets;

public sealed record GetMyBetsQuery(string TenantId, Guid UserId, int Limit = 50)
    : IQuery<IReadOnlyList<BetHistoryItemDto>>;
