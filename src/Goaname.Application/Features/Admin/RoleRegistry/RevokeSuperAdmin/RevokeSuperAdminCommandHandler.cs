using Goaname.Application.Common;
using Goaname.Application.Features.Admin.RoleRegistry.GetRoleRegistry;
using Goaname.Contracts.Admin;
using MediatR;

namespace Goaname.Application.Features.Admin.RoleRegistry.RevokeSuperAdmin;

public sealed record RevokeSuperAdminCommand(string Email) : ICommand<RoleRegistryDto>;

public sealed class RevokeSuperAdminCommandHandler(RoleRegistryService roleRegistryService)
    : IRequestHandler<RevokeSuperAdminCommand, RoleRegistryDto>
{
    public async Task<RoleRegistryDto> Handle(RevokeSuperAdminCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        await roleRegistryService.RemoveSuperAdminAsync(request.Email, cancellationToken).ConfigureAwait(false);
        var snapshot = await roleRegistryService.GetSnapshotAsync(cancellationToken).ConfigureAwait(false);
        return GetRoleRegistryQueryHandler.ToDto(snapshot);
    }
}
