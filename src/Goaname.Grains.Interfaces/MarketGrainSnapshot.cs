using Goaname.Domain.State;

namespace Goaname.Grains.Interfaces;

[GenerateSerializer]
public sealed class MarketGrainSnapshot
{
    [Id(0)] public MarketState State { get; set; } = new();

    [Id(1)] public decimal YesProbability { get; set; }

    [Id(2)] public decimal NoProbability { get; set; }

    [Id(3)] public decimal YesMultiplier { get; set; }

    [Id(4)] public decimal NoMultiplier { get; set; }
}
