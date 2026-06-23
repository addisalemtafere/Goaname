namespace Goaname.Grains.Interfaces;

[Alias("Goaname.Grains.Interfaces.IMarketCatalogGrain")]
public interface IMarketCatalogGrain : IGrainWithStringKey
{
    [Alias("RegisterAsync")]
    public Task RegisterAsync(Guid marketId);

    [Alias("RegisterCreatedAsync")]
    public Task RegisterCreatedAsync(Guid marketId);

    [Alias("GetPublishedMarketIdsAsync")]
    public Task<IReadOnlyList<Guid>> GetPublishedMarketIdsAsync();

    [Alias("GetAllMarketIdsAsync")]
    public Task<IReadOnlyList<Guid>> GetAllMarketIdsAsync();
}
