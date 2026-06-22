using Orleans;

namespace Goaname.Contracts.Markets;

[GenerateSerializer]
public sealed record OddsSnapshot(
    [property: Id(0)] decimal YesProbability,
    [property: Id(1)] decimal NoProbability,
    [property: Id(2)] decimal YesMultiplier,
    [property: Id(3)] decimal NoMultiplier);
