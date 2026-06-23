using Orleans;

namespace Goaname.Domain.State;

[GenerateSerializer]
public class UserCatalogState
{
    [Id(0)] public ICollection<Guid> UserIds { get; } = [];
}
