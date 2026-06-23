using Goaname.Application.Auth;
using Goaname.Application.Common;
using Goaname.Application.Features.Admin.RoleRegistry.GetRoleRegistry;
using Goaname.Contracts.Admin;
using MediatR;

namespace Goaname.Application.Features.Admin.RoleRegistry.GetRoleRegistry;

public sealed record GetRoleRegistryQuery : IQuery<RoleRegistryDto>;

public sealed class GetRoleRegistryQueryHandler(RoleRegistryService roleRegistryService)
    : IRequestHandler<GetRoleRegistryQuery, RoleRegistryDto>
{
    public async Task<RoleRegistryDto> Handle(GetRoleRegistryQuery request, CancellationToken cancellationToken)
    {
        var snapshot = await roleRegistryService.GetSnapshotAsync(cancellationToken).ConfigureAwait(false);
        return ToDto(snapshot);
    }

    internal static RoleRegistryDto ToDto(AuthorizationSnapshot snapshot) =>
        new()
        {
            SuperAdminEmails = snapshot.SuperAdminEmails,
            TenantAdmins = snapshot.TenantAdmins,
        };
}
