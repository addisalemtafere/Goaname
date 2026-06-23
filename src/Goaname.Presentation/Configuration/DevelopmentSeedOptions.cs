namespace Goaname.Presentation.Configuration;

internal sealed class DevelopmentSeedOptions
{
    public const string SectionName = "Development:Seed";

    public bool Enabled { get; init; } = true;

    public string DefaultPassword { get; init; } = "SuperAdmin123!";

    public string DefaultTenantId { get; init; } = "demo";

    public Dictionary<string, TenantSeedOptions> Tenants { get; init; } =
        new(StringComparer.OrdinalIgnoreCase);

    public ICollection<SeedUserOptions> Users { get; init; } = [];
}

internal sealed class TenantSeedOptions
{
    public string Name { get; init; } = string.Empty;

    public string Currency { get; init; } = "USD";
}

internal sealed class SeedUserOptions
{
    public string TenantId { get; init; } = string.Empty;

    public string Email { get; init; } = string.Empty;

    public string DisplayName { get; init; } = string.Empty;

    public string? Password { get; init; }
}
