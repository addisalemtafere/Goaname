namespace Goaname.Domain.Rules;

/// <summary>
/// Shared grain key matching rules.
/// </summary>
public static class GrainKeyRules
{
    public static bool TenantMatches(string grainKeyTenantId, string requestTenantId) =>
        string.Equals(grainKeyTenantId, requestTenantId, StringComparison.Ordinal);
}
