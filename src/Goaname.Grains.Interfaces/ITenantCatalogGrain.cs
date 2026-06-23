namespace Goaname.Grains.Interfaces;

[Alias("Goaname.Grains.Interfaces.ITenantCatalogGrain")]
public interface ITenantCatalogGrain : IGrainWithStringKey
{
    [Alias("RegisterAsync")]
    public Task RegisterAsync(string tenantId);

    [Alias("GetTenantIdsAsync")]
    public Task<IReadOnlyList<string>> GetTenantIdsAsync();
}
