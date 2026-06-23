using Goaname.Application.Auth;
using Goaname.Application.Common;
using Goaname.Contracts.Admin;
using Goaname.Domain.Exceptions;
using Goaname.Grains.Interfaces;
using MediatR;

namespace Goaname.Application.Features.Users.Admin.GetTenantUser;

public sealed record GetTenantUserQuery(string TenantId, Guid UserId) : IQuery<AdminUserDto>;

public sealed class GetTenantUserQueryHandler(
    IGrainFactory grainFactory,
    IUserRoleResolver roleResolver)
    : IRequestHandler<GetTenantUserQuery, AdminUserDto>
{
    public async Task<AdminUserDto> Handle(GetTenantUserQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var userGrain = grainFactory.GetGrain<IUserGrain>(GrainKeys.User(request.TenantId, request.UserId));
        var state = await userGrain.GetStateAsync().ConfigureAwait(false);

        if (state.UserId == Guid.Empty)
        {
            throw new NotFoundException("User was not found.");
        }

        return new AdminUserDto
        {
            UserId = state.UserId,
            TenantId = state.TenantId,
            DisplayName = state.DisplayName,
            Email = state.Email,
            PreferredCurrency = state.PreferredCurrency,
            KycStatus = state.KycStatus,
            PayoutProvider = state.PayoutProvider,
            PayoutAccountId = state.PayoutAccountId,
            PayoutAccountVerifiedAt = state.PayoutAccountVerifiedAt,
            CreatedAt = state.CreatedAt,
            LastActiveAt = state.LastActiveAt,
            Balance = state.Wallet.Balance,
            TotalDeposited = state.Wallet.TotalDeposited,
            TotalWithdrawn = state.Wallet.TotalWithdrawn,
            Roles = roleResolver.Resolve(request.TenantId, state.Email),
        };
    }
}
