using Goaname.Application.Common;
using Goaname.Application.Features.Admin.RoleRegistry.GetRoleRegistry;
using Goaname.Contracts.Admin;
using MediatR;

namespace Goaname.Application.Features.Admin.RoleRegistry.GrantSuperAdmin;

public sealed record GrantSuperAdminCommand(string Email) : ICommand<RoleRegistryDto>;

public sealed class GrantSuperAdminCommandHandler(RoleRegistryService roleRegistryService)
    : IRequestHandler<GrantSuperAdminCommand, RoleRegistryDto>
{
    public async Task<RoleRegistryDto> Handle(GrantSuperAdminCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        await roleRegistryService.AddSuperAdminAsync(request.Email, cancellationToken).ConfigureAwait(false);
        var snapshot = await roleRegistryService.GetSnapshotAsync(cancellationToken).ConfigureAwait(false);
        return GetRoleRegistryQueryHandler.ToDto(snapshot);
    }
}
