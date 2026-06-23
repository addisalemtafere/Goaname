using Goaname.Application.Auth;
using Goaname.Grains.Interfaces;
using Microsoft.Extensions.Options;
using Orleans.Runtime;
using AppAuthorizationOptions = Goaname.Application.Auth.AuthorizationOptions;

namespace Goaname.Presentation.Admin;

internal sealed class RoleRegistryBootstrapper(
    IGrainFactory grainFactory,
    IRoleRegistryProvider provider,
    IOptions<AppAuthorizationOptions> authorizationOptions) : IStartupTask
{
    public async Task Execute(CancellationToken cancellationToken)
    {
        var config = authorizationOptions.Value;
        var tenantAdmins = config.TenantAdmins.ToDictionary(
            static pair => pair.Key,
            static pair => (IReadOnlyList<string>)pair.Value,
            StringComparer.OrdinalIgnoreCase);

        var roleRegistry = grainFactory.GetGrain<IRoleRegistryGrain>(GrainKeys.PlatformRoleRegistry);
        await roleRegistry.EnsureSeededAsync([.. config.SuperAdminEmails], tenantAdmins).ConfigureAwait(false);
        await BackfillFromConfigAsync(roleRegistry, config).ConfigureAwait(false);
        await provider.RefreshAsync(cancellationToken).ConfigureAwait(false);

        var tenantCatalog = grainFactory.GetGrain<ITenantCatalogGrain>(GrainKeys.PlatformTenantCatalog);
        foreach (var tenantId in tenantAdmins.Keys)
        {
            await tenantCatalog.RegisterAsync(tenantId).ConfigureAwait(false);
        }

        foreach (var tenantId in await tenantCatalog.GetTenantIdsAsync().ConfigureAwait(false))
        {
            var tenantGrain = grainFactory.GetGrain<ITenantGrain>(GrainKeys.Tenant(tenantId));
            var tenantState = await tenantGrain.GetStateAsync().ConfigureAwait(false);
            if (!string.IsNullOrWhiteSpace(tenantState.TenantId))
            {
                await tenantCatalog.RegisterAsync(tenantState.TenantId).ConfigureAwait(false);
            }
        }
    }

    private static async Task BackfillFromConfigAsync(
        IRoleRegistryGrain roleRegistry,
        AppAuthorizationOptions config)
    {
        var state = await roleRegistry.GetStateAsync().ConfigureAwait(false);

        foreach (var email in config.SuperAdminEmails.Where(static value => !string.IsNullOrWhiteSpace(value)))
        {
            if (!ContainsEmail(state.SuperAdminEmails, email))
            {
                await roleRegistry.AddSuperAdminAsync(email).ConfigureAwait(false);
            }
        }

        foreach (var (tenantId, emails) in config.TenantAdmins)
        {
            foreach (var email in emails.Where(static value => !string.IsNullOrWhiteSpace(value)))
            {
                var assignment = state.TenantAdminAssignments.FirstOrDefault(
                    entry => string.Equals(entry.TenantId, tenantId, StringComparison.OrdinalIgnoreCase));

                if (assignment is null || !ContainsEmail(assignment.Emails, email))
                {
                    await roleRegistry.AddTenantAdminAsync(tenantId, email).ConfigureAwait(false);
                }
            }
        }
    }

    private static bool ContainsEmail(IEnumerable<string> emails, string email) =>
        emails.Any(candidate =>
            string.Equals(candidate.Trim(), email.Trim(), StringComparison.OrdinalIgnoreCase));
}
