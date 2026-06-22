using Goaname.Application.Features.Tenants.GetTenant;
using Goaname.Application.Features.Users.GetCurrentUser;
using Goaname.Contracts.Users;
using Goaname.Domain.Exceptions;
using Goaname.Grains.Interfaces;
using MediatR;

namespace Goaname.Application.Features.Users.DepositFunds;

public sealed class DepositFundsCommandHandler(IGrainFactory grainFactory, ISender sender)
    : IRequestHandler<DepositFundsCommand, WalletDto>
{
    public async Task<WalletDto> Handle(DepositFundsCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        await sender.Send(new GetCurrentUserQuery(request.TenantId, request.UserId), cancellationToken)
            .ConfigureAwait(false);

        var tenant = await sender.Send(new GetTenantQuery(request.TenantId), cancellationToken).ConfigureAwait(false);
        if (!tenant.DepositsEnabled)
        {
            throw new BusinessRuleException("Deposits are disabled for this tenant.");
        }

        var userGrain = grainFactory.GetGrain<IUserGrain>(GrainKeys.User(request.TenantId, request.UserId));
        var wallet = await userGrain.DepositAsync(request.Amount).ConfigureAwait(false);
        return UserMappings.ToWalletDto(wallet);
    }
}
