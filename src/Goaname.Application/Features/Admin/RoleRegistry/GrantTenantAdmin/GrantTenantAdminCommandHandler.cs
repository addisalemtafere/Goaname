using Goaname.Application.Common;
using Goaname.Application.Features.Admin.RoleRegistry.GetRoleRegistry;
using Goaname.Contracts.Admin;
using MediatR;

namespace Goaname.Application.Features.Admin.RoleRegistry.GrantTenantAdmin;

public sealed record GrantTenantAdminCommand(string TenantId, string Email) : ICommand<RoleRegistryDto>;

public sealed class GrantTenantAdminCommandHandler(RoleRegistryService roleRegistryService)
    : IRequestHandler<GrantTenantAdminCommand, RoleRegistryDto>
{
    public async Task<RoleRegistryDto> Handle(GrantTenantAdminCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        await roleRegistryService.AddTenantAdminAsync(request.TenantId, request.Email, cancellationToken).ConfigureAwait(false);
        var snapshot = await roleRegistryService.GetSnapshotAsync(cancellationToken).ConfigureAwait(false);
        return GetRoleRegistryQueryHandler.ToDto(snapshot);
    }
}
