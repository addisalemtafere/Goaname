using Goaname.Application.Features.Auth.Register;
using Goaname.Contracts.Auth;
using Goaname.Presentation.Auth;
using Goaname.Presentation.Configuration;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

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
        LocalAuthService localAuthService,
        IConfiguration configuration,
        [FromBody] RegisterRequest request,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        if (!GoanameAuthOptions.IsLocalAuthEnabled(configuration))
        {
            return Results.BadRequest("Local account registration is not enabled.");
        }

        await sender
            .Send(new RegisterCommand(request.TenantId, request.DisplayName, request.Email, request.Password), cancellationToken)
            .ConfigureAwait(false);

        var response = await localAuthService
            .SignInAsync(request.TenantId, request.Email, request.Password, cancellationToken)
            .ConfigureAwait(false);

        if (response is null)
        {
            return Results.Problem(
                "Registration succeeded but sign-in failed.",
                statusCode: StatusCodes.Status500InternalServerError);
        }

        return Results.Created($"/api/tenants/{request.TenantId}/users/me", response);
    }

    private static async Task<IResult> LoginAsync(
        LocalAuthService localAuthService,
        IConfiguration configuration,
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        if (!GoanameAuthOptions.IsLocalAuthEnabled(configuration))
        {
            return Results.BadRequest("Local account login is not enabled.");
        }

        var response = await localAuthService
            .SignInAsync(request.TenantId, request.Email, request.Password, cancellationToken)
            .ConfigureAwait(false);

        return response is null
            ? Results.Problem("Invalid email or password.", statusCode: StatusCodes.Status401Unauthorized)
            : Results.Ok(response);
    }

    private static Task<IResult> IssueDevTokenAsync(
        LocalAuthService localAuthService,
        IConfiguration configuration,
        IOptions<DevelopmentSeedOptions> seedOptions,
        [FromBody] DevTokenRequest? request)
    {
        if (!GoanameAuthOptions.IsLocalAuthEnabled(configuration))
        {
            return Task.FromResult<IResult>(Results.BadRequest("Development token issuance is not enabled."));
        }

        request ??= new DevTokenRequest { TenantId = "demo" };
        var password = seedOptions.Value.DefaultPassword;

        if (string.IsNullOrWhiteSpace(password))
        {
            return Task.FromResult<IResult>(Results.BadRequest("Development seed password is not configured."));
        }

        return IssueDevTokenCoreAsync(localAuthService, request, password);
    }

    private static async Task<IResult> IssueDevTokenCoreAsync(
        LocalAuthService localAuthService,
        DevTokenRequest request,
        string password)
    {
        try
        {
            var response = await localAuthService
                .IssueDevTokenAsync(request.TenantId, request.Email, password)
                .ConfigureAwait(false);

            return Results.Ok(new DevTokenResponse
            {
                AccessToken = response.AccessToken,
                UserId = response.UserId,
                TenantId = response.TenantId,
                ExpiresAt = response.ExpiresAt,
                Roles = response.Roles,
            });
        }
        catch (InvalidOperationException exception)
        {
            return Results.Problem(exception.Message, statusCode: StatusCodes.Status400BadRequest);
        }
    }
}
