namespace Goaname.Contracts.Tenants;

public sealed record AddTenantCategoryRequest
{
    public required string Name { get; init; }
}
