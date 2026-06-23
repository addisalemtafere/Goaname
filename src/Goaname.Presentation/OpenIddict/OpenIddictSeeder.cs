using Goaname.Presentation.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OpenIddict.Abstractions;
using static OpenIddict.Abstractions.OpenIddictConstants;

namespace Goaname.Presentation.OpenIddict;

internal sealed class OpenIddictSeeder(IServiceProvider serviceProvider, IConfiguration configuration) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        if (!GoanameAuthOptions.IsLocalAuthEnabled(configuration))
        {
            return;
        }

        using var scope = serviceProvider.CreateScope();
        var manager = scope.ServiceProvider.GetRequiredService<IOpenIddictApplicationManager>();
        var options = GoanameAuthOptions.GetOpenIddictOptions(configuration);

        if (await manager.FindByClientIdAsync(options.SpaClientId, cancellationToken).ConfigureAwait(false) is not null)
        {
            return;
        }

        await manager.CreateAsync(
            new OpenIddictApplicationDescriptor
            {
                ClientId = options.SpaClientId,
                DisplayName = "Goaname SPA",
                ClientType = ClientTypes.Public,
                Permissions =
                {
                    Permissions.Endpoints.Token,
                    Permissions.GrantTypes.Password,
                    Permissions.GrantTypes.RefreshToken,
                    Permissions.Prefixes.Scope + Scopes.OpenId,
                    Permissions.Prefixes.Scope + Scopes.Profile,
                    Permissions.Prefixes.Scope + Scopes.Email,
                    Permissions.Prefixes.Scope + Scopes.OfflineAccess,
                },
            },
            cancellationToken).ConfigureAwait(false);
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
