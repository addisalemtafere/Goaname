using Goaname.Domain.Constants;
using Goaname.Domain.Exceptions;
using Goaname.Domain.State;
using Goaname.Grains.Interfaces;
using Orleans;
using Orleans.Runtime;

namespace Goaname.Grains;

public class TenantGrain : Grain, ITenantGrain
{
    private readonly IPersistentState<TenantState> _state;

    public TenantGrain(
        [PersistentState(stateName: "tenant", storageName: "GoanameStore")]
        IPersistentState<TenantState> state)
    {
        _state = state;
    }

    public Task<TenantState> GetStateAsync()
    {
        // Orleans automatically loads the state from the database 
        // before the first method call on this grain.
        return Task.FromResult(_state.State);
    }

    public async Task InitializeAsync(string name, string currency)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        ArgumentException.ThrowIfNullOrWhiteSpace(currency);

        // Only initialize if it hasn't been initialized yet
        if (string.IsNullOrEmpty(_state.State.TenantId))
        {
            // Extract tenantId from the grain key (e.g., "mulasport_tenant" -> "mulasport")
            _state.State.TenantId = this.GetPrimaryKeyString().Split('_')[0]; 
            _state.State.Name = name;
            _state.State.Currency = currency;
            _state.State.LastUpdatedAt = DateTimeOffset.UtcNow;
            SeedDefaultCategoriesIfEmpty();

            // Save the changes to the database
            await _state.WriteStateAsync().ConfigureAwait(true);
        }
        else if (_state.State.EnabledCategories.Count == 0)
        {
            SeedDefaultCategoriesIfEmpty();
            _state.State.LastUpdatedAt = DateTimeOffset.UtcNow;
            await _state.WriteStateAsync().ConfigureAwait(true);
        }
    }

    public async Task<IReadOnlyList<string>> GetCategoriesAsync()
    {
        EnsureInitialized();

        var seeded = _state.State.EnabledCategories.Count == 0;
        SeedDefaultCategoriesIfEmpty();
        var merged = MergeMissingDefaultCategories();

        if (seeded || merged)
        {
            _state.State.LastUpdatedAt = DateTimeOffset.UtcNow;
            await _state.WriteStateAsync().ConfigureAwait(true);
        }

        return [.. _state.State.EnabledCategories.OrderBy(static category => category, StringComparer.OrdinalIgnoreCase)];
    }

    public async Task AddCategoryAsync(string category)
    {
        EnsureInitialized();
        var normalized = NormalizeCategory(category);

        if (ContainsCategory(normalized))
        {
            throw new BusinessRuleException($"Category '{normalized}' already exists.");
        }

        _state.State.EnabledCategories.Add(normalized);
        _state.State.LastUpdatedAt = DateTimeOffset.UtcNow;
        await _state.WriteStateAsync().ConfigureAwait(true);
    }

    public async Task RemoveCategoryAsync(string category)
    {
        EnsureInitialized();
        var normalized = NormalizeCategory(category);
        var existing = FindCategory(normalized);

        if (existing is null)
        {
            throw new BusinessRuleException($"Category '{normalized}' was not found.");
        }

        if (_state.State.EnabledCategories.Count <= 1)
        {
            throw new BusinessRuleException("At least one category must remain.");
        }

        _state.State.EnabledCategories.Remove(existing);
        _state.State.LastUpdatedAt = DateTimeOffset.UtcNow;
        await _state.WriteStateAsync().ConfigureAwait(true);
    }

    private void SeedDefaultCategoriesIfEmpty()
    {
        if (_state.State.EnabledCategories.Count > 0)
        {
            return;
        }

        foreach (var category in TenantDefaults.DefaultCategories)
        {
            _state.State.EnabledCategories.Add(category);
        }
    }

    private bool MergeMissingDefaultCategories()
    {
        var changed = false;

        foreach (var category in TenantDefaults.DefaultCategories)
        {
            if (ContainsCategory(category))
            {
                continue;
            }

            _state.State.EnabledCategories.Add(category);
            changed = true;
        }

        return changed;
    }

    private static string NormalizeCategory(string category)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(category);

        var normalized = category.Trim();
        if (normalized.Length > MarketConstraints.CategoryMaxLength)
        {
            throw new BusinessRuleException(
                $"Category must be at most {MarketConstraints.CategoryMaxLength} characters.");
        }

        return normalized;
    }

    private bool ContainsCategory(string category) => FindCategory(category) is not null;

    private string? FindCategory(string category) =>
        _state.State.EnabledCategories.FirstOrDefault(
            existing => string.Equals(existing, category, StringComparison.OrdinalIgnoreCase));

    private void EnsureInitialized()
    {
        if (string.IsNullOrEmpty(_state.State.TenantId))
        {
            throw new BusinessRuleException("Tenant has not been initialized.");
        }
    }

    public async Task UpdateBettingEnabledAsync(bool enabled)
    {
        _state.State.BettingEnabled = enabled;
        _state.State.LastUpdatedAt = DateTimeOffset.UtcNow;
        
        // Save the changes to the database
        await _state.WriteStateAsync().ConfigureAwait(true);
    }

    public async Task UpdateSettingsAsync(TenantSettingsPatch patch)
    {
        ArgumentNullException.ThrowIfNull(patch);
        EnsureInitialized();

        if (!string.IsNullOrWhiteSpace(patch.Name))
        {
            _state.State.Name = patch.Name.Trim();
        }

        if (patch.OperationalStatus.HasValue)
        {
            _state.State.OperationalStatus = patch.OperationalStatus.Value;
        }

        if (patch.BettingEnabled.HasValue)
        {
            _state.State.BettingEnabled = patch.BettingEnabled.Value;
        }

        if (patch.DepositsEnabled.HasValue)
        {
            _state.State.DepositsEnabled = patch.DepositsEnabled.Value;
        }

        if (patch.WithdrawalsEnabled.HasValue)
        {
            _state.State.WithdrawalsEnabled = patch.WithdrawalsEnabled.Value;
        }

        if (patch.PlatformFeePercent.HasValue)
        {
            if (patch.PlatformFeePercent.Value is < 0 or > 100)
            {
                throw new BusinessRuleException("Platform fee must be between 0 and 100 percent.");
            }

            _state.State.PlatformFeePercent = patch.PlatformFeePercent.Value;
        }

        if (patch.MaxBetAmount.HasValue)
        {
            if (patch.MaxBetAmount.Value <= 0)
            {
                throw new BusinessRuleException("Max bet amount must be greater than zero.");
            }

            _state.State.MaxBetAmount = patch.MaxBetAmount.Value;
        }

        if (patch.DefaultLiquidityParameter.HasValue)
        {
            if (patch.DefaultLiquidityParameter.Value <= 0)
            {
                throw new BusinessRuleException("Default liquidity parameter must be greater than zero.");
            }

            _state.State.DefaultLiquidityParameter = patch.DefaultLiquidityParameter.Value;
        }

        if (patch.ThemeKey is not null)
        {
            _state.State.ThemeKey = string.IsNullOrWhiteSpace(patch.ThemeKey) ? null : patch.ThemeKey.Trim();
        }

        if (patch.SuspensionReason is not null)
        {
            _state.State.SuspensionReason = string.IsNullOrWhiteSpace(patch.SuspensionReason) ? null : patch.SuspensionReason.Trim();
        }

        _state.State.LastUpdatedAt = DateTimeOffset.UtcNow;
        await _state.WriteStateAsync().ConfigureAwait(true);
    }
}
