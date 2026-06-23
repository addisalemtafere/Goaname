using Goaname.Application.Common;
using Goaname.Application.Features.Users.Admin.GetTenantUser;
using Goaname.Contracts.Admin;
using Goaname.Domain.Enums;
using Goaname.Grains.Interfaces;
using MediatR;

namespace Goaname.Application.Features.Users.Admin.SetUserKycStatus;

public sealed record SetUserKycStatusCommand(string TenantId, Guid UserId, KycStatus Status) : ICommand<AdminUserDto>;

public sealed class SetUserKycStatusCommandHandler(IGrainFactory grainFactory, ISender sender)
    : IRequestHandler<SetUserKycStatusCommand, AdminUserDto>
{
    public async Task<AdminUserDto> Handle(SetUserKycStatusCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var userGrain = grainFactory.GetGrain<IUserGrain>(GrainKeys.User(request.TenantId, request.UserId));
        await userGrain.AdminSetKycStatusAsync(request.Status).ConfigureAwait(false);

        return await sender.Send(new GetTenantUserQuery(request.TenantId, request.UserId), cancellationToken).ConfigureAwait(false);
    }
}
