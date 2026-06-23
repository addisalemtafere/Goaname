using Goaname.Application.Auth;
using Goaname.Contracts.Admin;
using Goaname.Presentation.Configuration;
using Microsoft.Extensions.Options;
using OpenIddict.Abstractions;
using static OpenIddict.Abstractions.OpenIddictConstants;

namespace Goaname.Presentation.Admin;

internal sealed class OpenIddictClientAdminService(IOpenIddictApplicationManager applicationManager)
{
    public async Task<IReadOnlyList<OAuthClientDto>> ListAsync(CancellationToken cancellationToken = default)
    {
        var clients = new List<OAuthClientDto>();

        await foreach (var application in applicationManager.ListAsync(cancellationToken: cancellationToken).ConfigureAwait(false))
        {
            var dto = await MapAsync(application, cancellationToken).ConfigureAwait(false);
            if (dto is not null)
            {
                clients.Add(dto);
            }
        }

        return clients.OrderBy(static client => client.ClientId, StringComparer.OrdinalIgnoreCase).ToList();
    }

    public async Task<OAuthClientDto> CreateAsync(CreateOAuthClientRequest request, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        if (await applicationManager.FindByClientIdAsync(request.ClientId, cancellationToken).ConfigureAwait(false) is not null)
        {
            throw new InvalidOperationException($"Client '{request.ClientId}' already exists.");
        }

        var descriptor = BuildDescriptor(request.ClientId, request.DisplayName, request.ClientType, request.Permissions, request.RedirectUris);
        await applicationManager.CreateAsync(descriptor, cancellationToken).ConfigureAwait(false);

        var created = await applicationManager.FindByClientIdAsync(request.ClientId, cancellationToken).ConfigureAwait(false)
            ?? throw new InvalidOperationException("Failed to create OAuth client.");

        return (await MapAsync(created, cancellationToken).ConfigureAwait(false))!;
    }

    public async Task<OAuthClientDto> UpdateAsync(
        string clientId,
        UpdateOAuthClientRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var application = await applicationManager.FindByClientIdAsync(clientId, cancellationToken).ConfigureAwait(false)
            ?? throw new InvalidOperationException($"Client '{clientId}' was not found.");

        var descriptor = new OpenIddictApplicationDescriptor();
        await applicationManager.PopulateAsync(descriptor, application, cancellationToken).ConfigureAwait(false);

        descriptor.DisplayName = request.DisplayName;
        descriptor.RedirectUris.Clear();
        foreach (var uri in request.RedirectUris.Where(static value => !string.IsNullOrWhiteSpace(value)))
        {
            descriptor.RedirectUris.Add(new Uri(uri.Trim(), UriKind.Absolute));
        }

        descriptor.Permissions.Clear();
        foreach (var permission in request.Permissions.Where(static value => !string.IsNullOrWhiteSpace(value)))
        {
            descriptor.Permissions.Add(permission.Trim());
        }

        await applicationManager.UpdateAsync(application, descriptor, cancellationToken).ConfigureAwait(false);

        return (await MapAsync(application, cancellationToken).ConfigureAwait(false))!;
    }

    public async Task DeleteAsync(string clientId, CancellationToken cancellationToken = default)
    {
        var application = await applicationManager.FindByClientIdAsync(clientId, cancellationToken).ConfigureAwait(false)
            ?? throw new InvalidOperationException($"Client '{clientId}' was not found.");

        await applicationManager.DeleteAsync(application, cancellationToken).ConfigureAwait(false);
    }

    public async Task<int> CountAsync(CancellationToken cancellationToken = default)
    {
        var count = 0;

        await foreach (var _ in applicationManager.ListAsync(cancellationToken: cancellationToken).ConfigureAwait(false))
        {
            count++;
        }

        return count;
    }

    private async Task<OAuthClientDto?> MapAsync(object application, CancellationToken cancellationToken)
    {
        var clientId = await applicationManager.GetClientIdAsync(application, cancellationToken).ConfigureAwait(false);
        if (string.IsNullOrWhiteSpace(clientId))
        {
            return null;
        }

        var descriptor = new OpenIddictApplicationDescriptor();
        await applicationManager.PopulateAsync(descriptor, application, cancellationToken).ConfigureAwait(false);

        return new OAuthClientDto
        {
            ClientId = clientId,
            DisplayName = descriptor.DisplayName ?? clientId,
            ClientType = descriptor.ClientType ?? ClientTypes.Public,
            Permissions = descriptor.Permissions.ToList(),
            RedirectUris = descriptor.RedirectUris.Select(static uri => uri.ToString()).ToList(),
        };
    }

    private static OpenIddictApplicationDescriptor BuildDescriptor(
        string clientId,
        string displayName,
        string clientType,
        IReadOnlyList<string> permissions,
        IReadOnlyList<string> redirectUris)
    {
        var descriptor = new OpenIddictApplicationDescriptor
        {
            ClientId = clientId.Trim(),
            DisplayName = displayName.Trim(),
            ClientType = string.Equals(clientType, ClientTypes.Confidential, StringComparison.OrdinalIgnoreCase)
                ? ClientTypes.Confidential
                : ClientTypes.Public,
        };

        foreach (var permission in permissions.Where(static value => !string.IsNullOrWhiteSpace(value)))
        {
            descriptor.Permissions.Add(permission.Trim());
        }

        if (descriptor.Permissions.Count == 0)
        {
            descriptor.Permissions.Add(Permissions.Endpoints.Token);
            descriptor.Permissions.Add(Permissions.GrantTypes.Password);
            descriptor.Permissions.Add(Permissions.GrantTypes.RefreshToken);
            descriptor.Permissions.Add(Permissions.Prefixes.Scope + Scopes.OpenId);
            descriptor.Permissions.Add(Permissions.Prefixes.Scope + Scopes.Profile);
            descriptor.Permissions.Add(Permissions.Prefixes.Scope + Scopes.Email);
            descriptor.Permissions.Add(Permissions.Prefixes.Scope + Scopes.OfflineAccess);
        }

        foreach (var uri in redirectUris.Where(static value => !string.IsNullOrWhiteSpace(value)))
        {
            descriptor.RedirectUris.Add(new Uri(uri.Trim(), UriKind.Absolute));
        }

        return descriptor;
    }
}

internal sealed class AppSettingsReader(
    IConfiguration configuration,
    IRoleRegistryProvider roleRegistryProvider)
{
    public AppSettingsDto Read()
    {
        var openIddictOptions = GoanameAuthOptions.GetOpenIddictOptions(configuration);
        var roles = roleRegistryProvider.GetCurrent();

        return new AppSettingsDto
        {
            SpaClientId = openIddictOptions.SpaClientId,
            TokenLifetimeHours = openIddictOptions.TokenLifetimeHours,
            LocalAuthEnabled = GoanameAuthOptions.IsLocalAuthEnabled(configuration),
            SuperAdminEmails = roles.SuperAdminEmails.ToList(),
            TenantAdmins = roles.TenantAdmins.ToDictionary(
                static pair => pair.Key,
                static pair => pair.Value,
                StringComparer.OrdinalIgnoreCase),
        };
    }
}
