using Goaname.Application.Auth;
using Goaname.Application.Features.Auth.Login;
using Goaname.Application.Features.Auth.Register;
using Goaname.Contracts.Auth;
using Goaname.Presentation.Configuration;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Goaname.Presentation.Endpoints;

internal static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        ArgumentNullException.ThrowIfNull(app);

        var group = app.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/register", RegisterAsync);
        group.MapPost("/login", LoginAsync);

        if (app.ServiceProvider.GetRequiredService<IWebHostEnvironment>().IsDevelopment())
        {
            group.MapPost("/dev-token", IssueDevTokenAsync);
        }

        return app;
    }

    private static async Task<IResult> RegisterAsync(
        ISender sender,
        IConfiguration configuration,
        [FromBody] RegisterRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        if (!JwtConfiguration.IsLocalAuthEnabled(configuration))
        {
            return Results.BadRequest("Local account registration is not enabled.");
        }

        var response = await sender.Send(
            new RegisterCommand(request.TenantId, request.DisplayName, request.Email, request.Password))
            .ConfigureAwait(false);

        return Results.Created($"/api/tenants/{request.TenantId}/users/me", response);
    }

    private static async Task<IResult> LoginAsync(
        ISender sender,
        IConfiguration configuration,
        [FromBody] LoginRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        if (!JwtConfiguration.IsLocalAuthEnabled(configuration))
        {
            return Results.BadRequest("Local account login is not enabled.");
        }

        var response = await sender.Send(
            new LoginCommand(request.TenantId, request.Email, request.Password))
            .ConfigureAwait(false);

        return Results.Ok(response);
    }

    private static IResult IssueDevTokenAsync(
        IJwtTokenIssuer tokenIssuer,
        IConfiguration configuration,
        [FromBody] DevTokenRequest? request)
    {
        if (!JwtConfiguration.IsLocalAuthEnabled(configuration))
        {
            return Results.BadRequest("Development JWT signing is not enabled.");
        }

        request ??= new DevTokenRequest { TenantId = "demo" };

        var token = tokenIssuer.IssueToken(
            request.UserId,
            request.TenantId,
            request.DisplayName,
            request.Email);

        return Results.Ok(new DevTokenResponse
        {
            AccessToken = token.AccessToken,
            UserId = token.UserId,
            TenantId = token.TenantId,
            ExpiresAt = token.ExpiresAt,
        });
    }
}
