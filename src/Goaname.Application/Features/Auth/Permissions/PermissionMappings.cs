using Goaname.Application.Auth;
using Goaname.Contracts.Auth;

namespace Goaname.Application.Features.Auth.Permissions;

public static class PermissionMappings
{
    public static PermissionDefinitionDto ToDto(PermissionDefinition definition)
    {
        ArgumentNullException.ThrowIfNull(definition);

        return new()
        {
            Name = definition.Name,
            DisplayName = definition.DisplayName,
            GroupName = definition.GroupName,
            ParentName = definition.ParentName,
        };
    }

    public static RolePermissionMatrixDto BuildMatrix() =>
        new()
        {
            Permissions = PermissionDefinitionProvider.All.Select(ToDto).ToList(),
            RolePermissions = GoanameRolePermissions.GetRolePermissionMatrix(),
        };
}
