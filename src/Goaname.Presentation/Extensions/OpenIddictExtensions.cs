using Goaname.Domain.Auth;
using Goaname.Presentation.Configuration;
using OpenIddict.Validation.AspNetCore;
using static OpenIddict.Abstractions.OpenIddictConstants;

namespace Goaname.Presentation.Extensions;

internal static class OpenIddictExtensions
{
    public static IServiceCollection AddGoanameOpenIddict(
        this IServiceCollection services,
        IConfiguration configuration,
        IHostEnvironment environment)
    {
        ArgumentNullException.ThrowIfNull(services);
        ArgumentNullException.ThrowIfNull(configuration);
        ArgumentNullException.ThrowIfNull(environment);

        var openIddictOptions = GoanameAuthOptions.GetOpenIddictOptions(configuration);
        var jwtSection = configuration.GetSection("Authentication:JwtBearer");
        var tokenLifetimeHours = openIddictOptions.TokenLifetimeHours > 0
            ? openIddictOptions.TokenLifetimeHours
            : jwtSection.GetValue("TokenLifetimeHours", 8);

        services.AddOpenIddict()
            .AddCore(options =>
            {
                options.UseEntityFrameworkCore()
                    .UseDbContext<Infrastructure.Persistence.Data.GoanameDbContext>();
            })
            .AddServer(options =>
            {
                options.SetTokenEndpointUris("/connect/token")
                    .SetAccessTokenLifetime(TimeSpan.FromHours(tokenLifetimeHours));

                options.AllowPasswordFlow()
                    .AllowRefreshTokenFlow();

                options.RegisterScopes(Scopes.OpenId, Scopes.Profile, Scopes.Email, Scopes.OfflineAccess);

                if (environment.IsDevelopment())
                {
                    options.AddEphemeralEncryptionKey()
                        .AddEphemeralSigningKey();
                }

                options.UseAspNetCore()
                    .EnableTokenEndpointPassthrough()
                    .DisableTransportSecurityRequirement();
            })
            .AddValidation(options =>
            {
                options.UseLocalServer();
                options.UseAspNetCore();
            });

        services.AddAuthentication(options =>
        {
            options.DefaultScheme = OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme;
            options.DefaultAuthenticateScheme = OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme;
        });

        services.AddAuthorizationBuilder()
            .AddPolicy(GoanamePolicies.AuthenticatedUser, policy =>
                policy.RequireAuthenticatedUser())
            .AddPolicy(GoanamePolicies.TenantAdmin, policy =>
                policy.RequireAuthenticatedUser()
                    .RequireRole(GoanameRoles.TenantAdmin, GoanameRoles.SuperAdmin))
            .AddPolicy(GoanamePolicies.SuperAdmin, policy =>
                policy.RequireAuthenticatedUser()
                    .RequireRole(GoanameRoles.SuperAdmin))
            .AddPolicy(GoanamePolicies.OrleansDashboard, policy =>
                policy.RequireAuthenticatedUser()
                    .RequireRole(GoanameRoles.SuperAdmin));

        return services;
    }
}
