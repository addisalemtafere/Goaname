using Goaname.Domain.Enums;
using Goaname.Domain.State;

namespace Goaname.Grains.Interfaces;

[GenerateSerializer]
public sealed record TenantSettingsPatch
{
    [Id(0)] public string? Name { get; init; }
    [Id(1)] public TenantOperationalStatus? OperationalStatus { get; init; }
    [Id(2)] public bool? BettingEnabled { get; init; }
    [Id(3)] public bool? DepositsEnabled { get; init; }
    [Id(4)] public bool? WithdrawalsEnabled { get; init; }
    [Id(5)] public decimal? PlatformFeePercent { get; init; }
    [Id(6)] public decimal? MaxBetAmount { get; init; }
    [Id(7)] public decimal? DefaultLiquidityParameter { get; init; }
    [Id(8)] public string? ThemeKey { get; init; }
    [Id(9)] public string? SuspensionReason { get; init; }
}

[Alias("Goaname.Grains.Interfaces.ITenantGrain")]
public interface ITenantGrain : IGrainWithStringKey
{
    [Alias("GetStateAsync")]
    public Task<TenantState> GetStateAsync();

    [Alias("InitializeAsync")]
    public Task InitializeAsync(string name, string currency);

    [Alias("UpdateBettingEnabledAsync")]
    public Task UpdateBettingEnabledAsync(bool enabled);

    [Alias("UpdateSettingsAsync")]
    public Task UpdateSettingsAsync(TenantSettingsPatch patch);

    [Alias("GetCategoriesAsync")]
    public Task<IReadOnlyList<string>> GetCategoriesAsync();

    [Alias("AddCategoryAsync")]
    public Task AddCategoryAsync(string category);

    [Alias("RemoveCategoryAsync")]
    public Task RemoveCategoryAsync(string category);
}
