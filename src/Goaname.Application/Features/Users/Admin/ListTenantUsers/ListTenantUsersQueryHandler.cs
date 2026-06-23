using Goaname.Application.Auth;
using Goaname.Application.Common;
using Goaname.Contracts.Admin;
using Goaname.Domain.Exceptions;
using Goaname.Grains.Interfaces;
using MediatR;

namespace Goaname.Application.Features.Users.Admin.ListTenantUsers;

public sealed record ListTenantUsersQuery(string TenantId) : IQuery<IReadOnlyList<UserSummaryDto>>;

public sealed class ListTenantUsersQueryHandler(
    IGrainFactory grainFactory,
    IUserRoleResolver roleResolver)
    : IRequestHandler<ListTenantUsersQuery, IReadOnlyList<UserSummaryDto>>
{
    public async Task<IReadOnlyList<UserSummaryDto>> Handle(ListTenantUsersQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var catalog = grainFactory.GetGrain<IUserCatalogGrain>(GrainKeys.UserCatalog(request.TenantId));
        var userIds = await catalog.GetUserIdsAsync().ConfigureAwait(false);
        var summaries = new List<UserSummaryDto>(userIds.Count);

        foreach (var userId in userIds)
        {
            var userGrain = grainFactory.GetGrain<IUserGrain>(GrainKeys.User(request.TenantId, userId));
            var state = await userGrain.GetStateAsync().ConfigureAwait(false);

            if (state.UserId == Guid.Empty)
            {
                continue;
            }

            summaries.Add(new UserSummaryDto
            {
                UserId = state.UserId,
                DisplayName = state.DisplayName,
                Email = state.Email,
                KycStatus = state.KycStatus,
                Balance = state.Wallet.Balance,
                Currency = state.Wallet.Currency,
                LastActiveAt = state.LastActiveAt,
                Roles = roleResolver.Resolve(request.TenantId, state.Email),
            });
        }

        return summaries.OrderBy(static user => user.DisplayName, StringComparer.OrdinalIgnoreCase).ToList();
    }
}
