using Goaname.Application.Auth;
using Goaname.Presentation.Admin;
using Goaname.Presentation.Auth;
using Goaname.Presentation.Authorization;
using Goaname.Presentation.Configuration;
using Goaname.Presentation.OpenIddict;
using Microsoft.AspNetCore.Authorization;
using AppAuthorizationOptions = Goaname.Application.Auth.AuthorizationOptions;

namespace Goaname.Presentation.Extensions;

internal static class AuthServiceExtensions
{
    public static IServiceCollection AddGoanameAuth(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(services);
        ArgumentNullException.ThrowIfNull(configuration);

        services.Configure<AppAuthorizationOptions>(configuration.GetSection(AppAuthorizationOptions.SectionName));
        services.Configure<DevelopmentSeedOptions>(configuration.GetSection(DevelopmentSeedOptions.SectionName));
        services.AddSingleton<IRoleRegistryProvider, RoleRegistryProvider>();
        services.AddSingleton<IUserRoleResolver, UserRoleResolver>();
        services.AddSingleton<IPermissionChecker, PermissionChecker>();
        services.AddSingleton<IAuthorizationHandler, PermissionAuthorizationHandler>();
        services.AddSingleton<IAuthorizationPolicyProvider, PermissionAuthorizationPolicyProvider>();
        services.AddScoped<PasswordGrantAuthenticator>();
        services.AddScoped<ConnectTokenExchangeService>();
        services.AddScoped<LocalAuthService>();
        services.AddHttpClient(ConnectTokenExchangeService.HttpClientName, (serviceProvider, client) =>
        {
            var configuration = serviceProvider.GetRequiredService<IConfiguration>();
            var baseUrl = configuration["Auth:ConnectTokenBaseUrl"]
                ?? configuration["ASPNETCORE_URLS"]?.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).FirstOrDefault()
                ?? "http://localhost:5107";
            client.BaseAddress = new UriBuilder(baseUrl) { Path = string.Empty }.Uri;
        });
        services.AddSingleton<RoleRegistryBootstrapper>();
        services.AddSingleton<DevelopmentDataSeeder>();
        services.AddHostedService<OpenIddictSeeder>();
        services.AddScoped<OpenIddictClientAdminService>();
        services.AddSingleton<AppSettingsReader>();

        return services;
    }
}
