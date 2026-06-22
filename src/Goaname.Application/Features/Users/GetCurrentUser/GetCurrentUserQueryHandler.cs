using Goaname.Application.Common;
using Goaname.Application.Features.Tenants.GetTenant;
using Goaname.Contracts.Users;
using Goaname.Grains.Interfaces;
using MediatR;

namespace Goaname.Application.Features.Users.GetCurrentUser;

public sealed class GetCurrentUserQueryHandler(IGrainFactory grainFactory, ISender sender)
    : IRequestHandler<GetCurrentUserQuery, UserProfileDto>
{
    public async Task<UserProfileDto> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var userGrain = grainFactory.GetGrain<IUserGrain>(GrainKeys.User(request.TenantId, request.UserId));
        var state = await userGrain.GetStateAsync().ConfigureAwait(false);

        if (state.UserId == Guid.Empty)
        {
            var tenant = await sender.Send(new GetTenantQuery(request.TenantId), cancellationToken).ConfigureAwait(false);
            await userGrain.InitializeAsync(
                request.UserId,
                request.TenantId,
                request.DisplayName ?? $"Trader {request.UserId.ToString()[..8]}",
                request.Email ?? $"{request.UserId:N}@users.goaname.local",
                tenant.Currency).ConfigureAwait(false);

            state = await userGrain.GetStateAsync().ConfigureAwait(false);
        }

        var tenantState = await sender.Send(new GetTenantQuery(request.TenantId), cancellationToken).ConfigureAwait(false);
        return UserMappings.ToProfileDto(state, tenantState.WithdrawalsEnabled);
    }
}
