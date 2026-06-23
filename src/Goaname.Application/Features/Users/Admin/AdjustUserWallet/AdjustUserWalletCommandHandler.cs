using Goaname.Application.Common;
using Goaname.Application.Features.Users;
using Goaname.Contracts.Users;
using Goaname.Domain.Exceptions;
using Goaname.Grains.Interfaces;
using MediatR;

namespace Goaname.Application.Features.Users.Admin.AdjustUserWallet;

public sealed record AdjustUserWalletCommand(string TenantId, Guid UserId, decimal Amount) : ICommand<WalletDto>;

public sealed class AdjustUserWalletCommandHandler(IGrainFactory grainFactory)
    : IRequestHandler<AdjustUserWalletCommand, WalletDto>
{
    public async Task<WalletDto> Handle(AdjustUserWalletCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        if (request.Amount == 0)
        {
            throw new BusinessRuleException("Adjustment amount cannot be zero.");
        }

        var userGrain = grainFactory.GetGrain<IUserGrain>(GrainKeys.User(request.TenantId, request.UserId));
        var wallet = await userGrain.AdminAdjustWalletAsync(request.Amount).ConfigureAwait(false);
        return UserMappings.ToWalletDto(wallet);
    }
}
