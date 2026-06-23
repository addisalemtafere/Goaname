using Goaname.Application.Common;
using Goaname.Application.Features.Admin.RoleRegistry.GetRoleRegistry;
using Goaname.Contracts.Admin;
using MediatR;

namespace Goaname.Application.Features.Admin.RoleRegistry.UpdateRoleRegistry;

public sealed record UpdateRoleRegistryCommand(UpdateRoleRegistryRequest Request) : ICommand<RoleRegistryDto>;

public sealed class UpdateRoleRegistryCommandHandler(RoleRegistryService roleRegistryService)
    : IRequestHandler<UpdateRoleRegistryCommand, RoleRegistryDto>
{
    public async Task<RoleRegistryDto> Handle(UpdateRoleRegistryCommand command, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(command);
        ArgumentNullException.ThrowIfNull(command.Request);

        await roleRegistryService
            .ReplaceAsync(command.Request.SuperAdminEmails, command.Request.TenantAdmins, cancellationToken)
            .ConfigureAwait(false);

        var snapshot = await roleRegistryService.GetSnapshotAsync(cancellationToken).ConfigureAwait(false);
        return GetRoleRegistryQueryHandler.ToDto(snapshot);
    }
}
