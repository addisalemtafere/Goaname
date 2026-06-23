using System.Security.Claims;
using Goaname.Presentation.Auth;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Authentication;
using OpenIddict.Abstractions;
using OpenIddict.Server.AspNetCore;
using static OpenIddict.Abstractions.OpenIddictConstants;

namespace Goaname.Presentation.Endpoints;

internal static class ConnectTokenEndpoints
{
    public static IEndpointRouteBuilder MapConnectTokenEndpoints(this IEndpointRouteBuilder app)
    {
        ArgumentNullException.ThrowIfNull(app);

        app.MapPost("/connect/token", ExchangeAsync)
            .DisableAntiforgery()
            .WithTags("Auth");

        return app;
    }

    private static async Task<IResult> ExchangeAsync(
        HttpContext httpContext,
        PasswordGrantAuthenticator passwordGrantAuthenticator,
        CancellationToken cancellationToken)
    {
        var request = httpContext.GetOpenIddictServerRequest()
            ?? throw new InvalidOperationException("The OpenID Connect request cannot be retrieved.");

        if (request.IsPasswordGrantType())
        {
            return await HandlePasswordGrantAsync(passwordGrantAuthenticator, request, cancellationToken)
                .ConfigureAwait(false);
        }

        if (request.IsRefreshTokenGrantType())
        {
            return await HandleRefreshGrantAsync(httpContext).ConfigureAwait(false);
        }

        return Results.Problem("The specified grant type is not supported.", statusCode: StatusCodes.Status400BadRequest);
    }

    private static async Task<IResult> HandlePasswordGrantAsync(
        PasswordGrantAuthenticator passwordGrantAuthenticator,
        OpenIddictRequest request,
        CancellationToken cancellationToken)
    {
        var tenantId = request.GetParameter("tenant_id")?.ToString();
        if (string.IsNullOrWhiteSpace(tenantId))
        {
            return Results.Problem("tenant_id is required.", statusCode: StatusCodes.Status400BadRequest);
        }

        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return Results.Problem("username and password are required.", statusCode: StatusCodes.Status400BadRequest);
        }

        var principal = await passwordGrantAuthenticator
            .AuthenticateAsync(tenantId, request.Username, request.Password, cancellationToken)
            .ConfigureAwait(false);

        if (principal is null)
        {
            return InvalidGrant("Invalid email or password.");
        }

        return SignIn(principal);
    }

    private static async Task<IResult> HandleRefreshGrantAsync(HttpContext httpContext)
    {
        var result = await httpContext
            .AuthenticateAsync(OpenIddictServerAspNetCoreDefaults.AuthenticationScheme)
            .ConfigureAwait(false);

        if (result?.Principal is null)
        {
            return InvalidGrant("The refresh token is invalid.");
        }

        return SignIn(result.Principal);
    }

    private static IResult SignIn(ClaimsPrincipal principal) =>
        Results.SignIn(
            principal,
            authenticationScheme: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);

    private static IResult InvalidGrant(string description) =>
        Results.Forbid(
            authenticationSchemes: [OpenIddictServerAspNetCoreDefaults.AuthenticationScheme],
            properties: new AuthenticationProperties(new Dictionary<string, string?>
            {
                [OpenIddictServerAspNetCoreConstants.Properties.Error] = Errors.InvalidGrant,
                [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = description,
            }));
}
