using Goaname.Application.Auth;
using Goaname.Presentation.Auth;
using Microsoft.Extensions.DependencyInjection;

namespace Goaname.Presentation.Extensions;

internal static class AuthServiceExtensions
{
    public static IServiceCollection AddGoanameAuth(this IServiceCollection services)
    {
        ArgumentNullException.ThrowIfNull(services);

        services.AddSingleton<IJwtTokenIssuer>(sp =>
            new JwtTokenIssuer(sp.GetRequiredService<IConfiguration>()));

        return services;
    }
}
