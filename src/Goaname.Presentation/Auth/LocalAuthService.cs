using Goaname.Contracts.Auth;

namespace Goaname.Presentation.Auth;

internal sealed class LocalAuthService(
    PasswordGrantAuthenticator passwordGrantAuthenticator,
    ConnectTokenExchangeService connectTokenExchange)
{
    public async Task<AuthResponse?> SignInAsync(
        string tenantId,
        string email,
        string password,
        CancellationToken cancellationToken = default)
    {
        var principal = await passwordGrantAuthenticator
            .AuthenticateAsync(tenantId, email, password, cancellationToken)
            .ConfigureAwait(false);

        if (principal is null)
        {
            return null;
        }

        var token = await connectTokenExchange
            .ExchangePasswordAsync(tenantId, email, password, cancellationToken)
            .ConfigureAwait(false);

        return AuthResponseMapper.FromPrincipal(principal, token.AccessToken, token.ExpiresAt);
    }

    public async Task<AuthResponse> IssueDevTokenAsync(
        string tenantId,
        string email,
        string password,
        CancellationToken cancellationToken = default)
    {
        var response = await SignInAsync(tenantId, email, password, cancellationToken)
            .ConfigureAwait(false);

        return response ?? throw new InvalidOperationException("Dev token issuance failed.");
    }
}
