using Goaname.Application.Features.Tenants.GetTenant;
using Goaname.Application.Features.Users.GetCurrentUser;
using Goaname.Contracts.Users;
using Goaname.Grains.Interfaces;
using MediatR;

namespace Goaname.Application.Features.Users.VerifyPayoutAccount;

public sealed class VerifyPayoutAccountCommandHandler(IGrainFactory grainFactory, ISender sender)
    : IRequestHandler<VerifyPayoutAccountCommand, UserProfileDto>
{
    public async Task<UserProfileDto> Handle(VerifyPayoutAccountCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        await sender.Send(new GetCurrentUserQuery(request.TenantId, request.UserId), cancellationToken)
            .ConfigureAwait(false);

        var userGrain = grainFactory.GetGrain<IUserGrain>(GrainKeys.User(request.TenantId, request.UserId));
        await userGrain.VerifyPayoutAccountAsync().ConfigureAwait(false);

        var tenant = await sender.Send(new GetTenantQuery(request.TenantId), cancellationToken).ConfigureAwait(false);
        var state = await userGrain.GetStateAsync().ConfigureAwait(false);
        return UserMappings.ToProfileDto(state, tenant.WithdrawalsEnabled);
    }
}
