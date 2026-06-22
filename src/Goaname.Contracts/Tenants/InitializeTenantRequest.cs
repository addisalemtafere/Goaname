namespace Goaname.Contracts.Tenants;

public sealed record InitializeTenantRequest
{
    public required string Name { get; init; }
    public required string Currency { get; init; }
}
