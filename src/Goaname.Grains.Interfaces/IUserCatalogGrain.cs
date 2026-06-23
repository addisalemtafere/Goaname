namespace Goaname.Grains.Interfaces;

[Alias("Goaname.Grains.Interfaces.IUserCatalogGrain")]
public interface IUserCatalogGrain : IGrainWithStringKey
{
    [Alias("RegisterAsync")]
    public Task RegisterAsync(Guid userId);

    [Alias("GetUserIdsAsync")]
    public Task<IReadOnlyList<Guid>> GetUserIdsAsync();
}
