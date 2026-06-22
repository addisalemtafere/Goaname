using Orleans;

namespace Goaname.Domain.State;

[GenerateSerializer]
public class MarketCatalogState
{
    [Id(0)] public ICollection<Guid> PublishedMarketIds { get; } = [];

    [Id(1)] public ICollection<Guid> AllMarketIds { get; } = [];
}
