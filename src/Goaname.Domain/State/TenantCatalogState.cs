using Orleans;

namespace Goaname.Domain.State;

[GenerateSerializer]
public class TenantCatalogState
{
    [Id(0)] public ICollection<string> TenantIds { get; } = [];
}
