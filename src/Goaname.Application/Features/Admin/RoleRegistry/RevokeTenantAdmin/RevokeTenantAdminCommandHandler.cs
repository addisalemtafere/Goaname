using Goaname.Application.Common;
using Goaname.Application.Features.Admin.RoleRegistry.GetRoleRegistry;
using Goaname.Contracts.Admin;
using MediatR;

namespace Goaname.Application.Features.Admin.RoleRegistry.RevokeTenantAdmin;

public sealed record RevokeTenantAdminCommand(string TenantId, string Email) : ICommand<RoleRegistryDto>;

public sealed class RevokeTenantAdminCommandHandler(RoleRegistryService roleRegistryService)
    : IRequestHandler<RevokeTenantAdminCommand, RoleRegistryDto>
{
    public async Task<RoleRegistryDto> Handle(RevokeTenantAdminCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        await roleRegistryService.RemoveTenantAdminAsync(request.TenantId, request.Email, cancellationToken).ConfigureAwait(false);
        var snapshot = await roleRegistryService.GetSnapshotAsync(cancellationToken).ConfigureAwait(false);
        return GetRoleRegistryQueryHandler.ToDto(snapshot);
    }
}
