using Goaname.Domain.Enums;

namespace Goaname.Contracts.Markets;

public sealed record ResolveMarketRequest
{
    public required Outcome WinningOutcome { get; init; }
}
