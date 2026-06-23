namespace Goaname.Application.Auth;

public sealed record PermissionDefinition(
    string Name,
    string DisplayName,
    string GroupName,
    string? ParentName = null);
