using Goaname.Application.Common;
using Goaname.Application.Features.Users.GetCurrentUser;
using Goaname.Contracts.Users;
using Goaname.Grains.Interfaces;
using MediatR;

namespace Goaname.Application.Features.Users.GetCurrentUserWallet;

public sealed class GetCurrentUserWalletQueryHandler(IGrainFactory grainFactory, ISender sender)
    : IRequestHandler<GetCurrentUserWalletQuery, WalletDto>
{
    public async Task<WalletDto> Handle(GetCurrentUserWalletQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        await sender.Send(new GetCurrentUserQuery(request.TenantId, request.UserId), cancellationToken)
            .ConfigureAwait(false);

        var userGrain = grainFactory.GetGrain<IUserGrain>(GrainKeys.User(request.TenantId, request.UserId));
        var state = await userGrain.GetStateAsync().ConfigureAwait(false);
        return UserMappings.ToWalletDto(state.Wallet);
    }
}
