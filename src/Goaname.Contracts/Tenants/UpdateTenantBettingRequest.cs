namespace Goaname.Contracts.Tenants;

public sealed record UpdateTenantBettingRequest
{
    public bool Enabled { get; init; }
}
