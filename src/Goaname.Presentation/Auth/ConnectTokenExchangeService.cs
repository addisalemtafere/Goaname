using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Goaname.Presentation.Configuration;
using Microsoft.Extensions.Options;
using OpenIddict.Abstractions;
using static OpenIddict.Abstractions.OpenIddictConstants;

namespace Goaname.Presentation.Auth;

internal sealed class ConnectTokenExchangeService(
    IHttpClientFactory httpClientFactory,
    IOptions<OpenIddictOptions> options)
{
    public const string HttpClientName = "OpenIddictConnect";

    public async Task<TokenExchangeResult> ExchangePasswordAsync(
        string tenantId,
        string email,
        string password,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(tenantId);
        ArgumentException.ThrowIfNullOrWhiteSpace(email);
        ArgumentException.ThrowIfNullOrWhiteSpace(password);

        var client = httpClientFactory.CreateClient(HttpClientName);
        var requestUri = client.BaseAddress is null
            ? new Uri("/connect/token", UriKind.Relative)
            : new Uri(client.BaseAddress, "connect/token");
        using var content = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            [Parameters.GrantType] = GrantTypes.Password,
            [Parameters.ClientId] = options.Value.SpaClientId,
            [Parameters.Username] = email,
            [Parameters.Password] = password,
            [Parameters.Scope] = string.Join(' ',
                Scopes.OpenId,
                Scopes.Profile,
                Scopes.Email,
                Scopes.OfflineAccess),
            ["tenant_id"] = tenantId.Trim(),
        });

        using var response = await client
            .PostAsync(requestUri, content, cancellationToken)
            .ConfigureAwait(false);

        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync(cancellationToken).ConfigureAwait(false);
            throw new InvalidOperationException(
                string.IsNullOrWhiteSpace(errorBody)
                    ? $"Token exchange failed ({(int)response.StatusCode})."
                    : errorBody);
        }

        var tokenResponse = await response.Content
            .ReadFromJsonAsync<TokenResponse>(cancellationToken)
            .ConfigureAwait(false)
            ?? throw new InvalidOperationException("Token exchange returned an empty response.");

        if (string.IsNullOrWhiteSpace(tokenResponse.AccessToken))
        {
            throw new InvalidOperationException("Token exchange did not return an access token.");
        }

        return new TokenExchangeResult(
            tokenResponse.AccessToken,
            DateTimeOffset.UtcNow.AddSeconds(tokenResponse.ExpiresIn > 0 ? tokenResponse.ExpiresIn : 28_800));
    }

    private sealed record TokenResponse(
        [property: JsonPropertyName("access_token")] string AccessToken,
        [property: JsonPropertyName("expires_in")] int ExpiresIn);
}

internal sealed record TokenExchangeResult(string AccessToken, DateTimeOffset ExpiresAt);
