using Goaname.Contracts.Markets;
using Goaname.Grains.Interfaces;

namespace Goaname.Application.Features.Markets;

internal static class MarketDtoMapper
{
    public static MarketDto MapToDto(MarketGrainSnapshot snapshot) =>
        new()
        {
            Id = snapshot.State.Id,
            TenantId = snapshot.State.TenantId,
            Title = snapshot.State.Title,
            Category = snapshot.State.Category,
            Status = snapshot.State.Status,
            TradingEndsAt = snapshot.State.TradingEndsAt,
            YesProbability = snapshot.YesProbability,
            NoProbability = snapshot.NoProbability,
            YesMultiplier = snapshot.YesMultiplier,
            NoMultiplier = snapshot.NoMultiplier,
            TotalVolume = snapshot.State.TotalVolume,
            UniqueTraders = snapshot.State.UniqueTradersCount,
            IsVisible = snapshot.State.IsVisible,
        };

    public static OddsSnapshot ToOddsSnapshot(MarketGrainSnapshot snapshot) =>
        new(
            snapshot.YesProbability,
            snapshot.NoProbability,
            snapshot.YesMultiplier,
            snapshot.NoMultiplier);
}
