using Goaname.Domain.Auth;
using Goaname.Grains.Interfaces;
using Goaname.Presentation.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Orleans.Runtime;
using AppAuthorizationOptions = Goaname.Application.Auth.AuthorizationOptions;

namespace Goaname.Presentation.Admin;

internal sealed class DevelopmentDataSeeder(
    IGrainFactory grainFactory,
    IHostEnvironment environment,
    IConfiguration configuration,
    IOptions<DevelopmentSeedOptions> seedOptions,
    IOptions<AppAuthorizationOptions> authorizationOptions) : IStartupTask
{
    public async Task Execute(CancellationToken cancellationToken)
    {
        if (!environment.IsDevelopment() ||
            !GoanameAuthOptions.IsLocalAuthEnabled(configuration) ||
            !seedOptions.Value.Enabled)
        {
            return;
        }

        var options = seedOptions.Value;
        var tenants = ResolveTenants(options);
        var users = ResolveUsers(options, authorizationOptions.Value);

        foreach (var (tenantId, tenant) in tenants)
        {
            var tenantGrain = grainFactory.GetGrain<ITenantGrain>(GrainKeys.Tenant(tenantId));
            await tenantGrain.InitializeAsync(tenant.Name, tenant.Currency).ConfigureAwait(false);

            var tenantCatalog = grainFactory.GetGrain<ITenantCatalogGrain>(GrainKeys.PlatformTenantCatalog);
            await tenantCatalog.RegisterAsync(tenantId).ConfigureAwait(false);
        }

        foreach (var user in users)
        {
            await SeedUserAsync(grainFactory, user, options.DefaultPassword, tenants).ConfigureAwait(false);
        }
    }

    private static Dictionary<string, TenantSeedOptions> ResolveTenants(DevelopmentSeedOptions options)
    {
        var tenants = new Dictionary<string, TenantSeedOptions>(StringComparer.OrdinalIgnoreCase);

        foreach (var (tenantId, tenant) in options.Tenants)
        {
            if (string.IsNullOrWhiteSpace(tenantId))
            {
                continue;
            }

            tenants[tenantId.Trim()] = tenant;
        }

        if (tenants.Count == 0 && !string.IsNullOrWhiteSpace(options.DefaultTenantId))
        {
            tenants[options.DefaultTenantId.Trim()] = new TenantSeedOptions
            {
                Name = "Demo",
                Currency = "USD",
            };
        }

        return tenants;
    }

    private static List<SeedUserOptions> ResolveUsers(
        DevelopmentSeedOptions seed,
        AppAuthorizationOptions authorization)
    {
        var users = new List<SeedUserOptions>();
        var defaultTenantId = seed.DefaultTenantId.Trim();

        foreach (var email in authorization.SuperAdminEmails.Where(static value => !string.IsNullOrWhiteSpace(value)))
        {
            users.Add(new SeedUserOptions
            {
                TenantId = defaultTenantId,
                Email = email.Trim(),
                DisplayName = "Super Admin",
            });
        }

        foreach (var (tenantId, emails) in authorization.TenantAdmins)
        {
            foreach (var email in emails.Where(static value => !string.IsNullOrWhiteSpace(value)))
            {
                var normalizedEmail = email.Trim();
                if (users.Any(candidate =>
                        string.Equals(candidate.Email, normalizedEmail, StringComparison.OrdinalIgnoreCase) &&
                        string.Equals(candidate.TenantId, tenantId, StringComparison.OrdinalIgnoreCase)))
                {
                    continue;
                }

                users.Add(new SeedUserOptions
                {
                    TenantId = tenantId.Trim(),
                    Email = normalizedEmail,
                    DisplayName = "Tenant Admin",
                });
            }
        }

        foreach (var user in seed.Users)
        {
            if (string.IsNullOrWhiteSpace(user.Email) || string.IsNullOrWhiteSpace(user.TenantId))
            {
                continue;
            }

            var normalizedEmail = user.Email.Trim();
            var tenantId = user.TenantId.Trim();
            if (users.Any(candidate =>
                    string.Equals(candidate.Email, normalizedEmail, StringComparison.OrdinalIgnoreCase) &&
                    string.Equals(candidate.TenantId, tenantId, StringComparison.OrdinalIgnoreCase)))
            {
                continue;
            }

            users.Add(new SeedUserOptions
            {
                TenantId = tenantId,
                Email = normalizedEmail,
                DisplayName = user.DisplayName,
                Password = user.Password,
            });
        }

        if (!users.Any(user =>
                !IsAdminUser(user.Email, authorization) &&
                string.Equals(user.TenantId, defaultTenantId, StringComparison.OrdinalIgnoreCase)))
        {
            users.Add(new SeedUserOptions
            {
                TenantId = defaultTenantId,
                Email = "player@goaname.local",
                DisplayName = "Demo Player",
            });
        }

        return users;
    }

    private static bool IsAdminUser(string email, AppAuthorizationOptions authorization)
    {
        var normalizedEmail = email.Trim().ToUpperInvariant();

        if (authorization.SuperAdminEmails.Any(candidate =>
                string.Equals(candidate.Trim().ToUpperInvariant(), normalizedEmail, StringComparison.Ordinal)))
        {
            return true;
        }

        return authorization.TenantAdmins.Values
            .SelectMany(static emails => emails)
            .Any(candidate => string.Equals(candidate.Trim().ToUpperInvariant(), normalizedEmail, StringComparison.Ordinal));
    }

    private static async Task SeedUserAsync(
        IGrainFactory grainFactory,
        SeedUserOptions user,
        string defaultPassword,
        Dictionary<string, TenantSeedOptions> tenants)
    {
        var tenantId = user.TenantId.Trim();
        var email = user.Email.Trim().ToUpperInvariant();
        var displayName = string.IsNullOrWhiteSpace(user.DisplayName)
            ? email.Split('@')[0]
            : user.DisplayName.Trim();
        var password = string.IsNullOrWhiteSpace(user.Password) ? defaultPassword : user.Password;

        if (!tenants.ContainsKey(tenantId))
        {
            return;
        }

        var authGrain = grainFactory.GetGrain<IUserAuthGrain>(GrainKeys.UserAuth(tenantId, email));
        var existing = await authGrain.GetStateAsync().ConfigureAwait(false);
        if (!string.IsNullOrEmpty(existing.Email))
        {
            return;
        }

        var tenantGrain = grainFactory.GetGrain<ITenantGrain>(GrainKeys.Tenant(tenantId));
        var tenantState = await tenantGrain.GetStateAsync().ConfigureAwait(false);
        if (string.IsNullOrWhiteSpace(tenantState.TenantId))
        {
            return;
        }

        var userId = Guid.NewGuid();
        await authGrain.RegisterAsync(userId, displayName, email, PasswordHasher.Hash(password)).ConfigureAwait(false);

        var userGrain = grainFactory.GetGrain<IUserGrain>(GrainKeys.User(tenantId, userId));
        await userGrain.InitializeAsync(userId, tenantId, displayName, email, tenantState.Currency).ConfigureAwait(false);

        var userCatalog = grainFactory.GetGrain<IUserCatalogGrain>(GrainKeys.UserCatalog(tenantId));
        await userCatalog.RegisterAsync(userId).ConfigureAwait(false);
    }
}
