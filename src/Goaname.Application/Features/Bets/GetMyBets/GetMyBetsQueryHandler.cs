using Goaname.Application.Common.Abstractions;
using Goaname.Application.Features.Users.GetCurrentUser;
using Goaname.Contracts.Bets;
using MediatR;

namespace Goaname.Application.Features.Bets.GetMyBets;

public sealed class GetMyBetsQueryHandler(IBetHistoryRepository betHistoryRepository, ISender sender)
    : IRequestHandler<GetMyBetsQuery, IReadOnlyList<BetHistoryItemDto>>
{
    public async Task<IReadOnlyList<BetHistoryItemDto>> Handle(
        GetMyBetsQuery request,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        await sender.Send(new GetCurrentUserQuery(request.TenantId, request.UserId), cancellationToken)
            .ConfigureAwait(false);

        var entries = await betHistoryRepository
            .ListByUserAsync(request.TenantId, request.UserId, request.Limit, cancellationToken)
            .ConfigureAwait(false);

        return entries.Select(BetHistoryMappings.ToDto).ToList();
    }
}
