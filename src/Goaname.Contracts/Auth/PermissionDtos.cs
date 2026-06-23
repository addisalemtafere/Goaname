namespace Goaname.Contracts.Auth;

public sealed record PermissionDefinitionDto
{
    public required string Name { get; init; }
    public required string DisplayName { get; init; }
    public required string GroupName { get; init; }
    public string? ParentName { get; init; }
}

public sealed record RolePermissionMatrixDto
{
    public required IReadOnlyList<PermissionDefinitionDto> Permissions { get; init; }
    public required IReadOnlyDictionary<string, IReadOnlyList<string>> RolePermissions { get; init; }
}
