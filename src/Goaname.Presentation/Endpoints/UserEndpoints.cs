using System.Security.Claims;
using Goaname.Application.Features.Users.DepositFunds;
using Goaname.Application.Features.Users.GetCurrentUser;
using Goaname.Application.Features.Users.GetCurrentUserWallet;
using Goaname.Application.Features.Users.LinkPayoutAccount;
using Goaname.Application.Features.Users.UpdatePreferredCurrency;
using Goaname.Application.Features.Users.VerifyPayoutAccount;
using Goaname.Contracts.Users;
using Goaname.Presentation.Configuration;
using Goaname.Presentation.Extensions;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Goaname.Presentation.Endpoints;

internal static class UserEndpoints
{
    public static IEndpointRouteBuilder MapUserEndpoints(this IEndpointRouteBuilder app)
    {
        ArgumentNullException.ThrowIfNull(app);

        var group = app.MapGroup("/api/tenants/{tenantId}/users")
            .WithTags("Users")
            .RequireAuthorization(GoanamePolicies.AuthenticatedUser);

        group.MapGet("/me", GetCurrentUserAsync);
        group.MapGet("/me/wallet", GetCurrentUserWalletAsync);
        group.MapPost("/me/deposit", DepositFundsAsync);
        group.MapPatch("/me/currency", UpdatePreferredCurrencyAsync);
        group.MapPost("/me/payout-account", LinkPayoutAccountAsync);
        group.MapPost("/me/payout-account/verify", VerifyPayoutAccountAsync);

        return app;
    }

    private static async Task<IResult> GetCurrentUserAsync(
        HttpContext httpContext,
        ISender sender,
        string tenantId)
    {
        var userId = httpContext.GetUserId();
        tenantId = httpContext.GetTenantId(tenantId);

        var displayName = httpContext.User.FindFirstValue(ClaimTypes.Name);
        var email = httpContext.User.FindFirstValue(ClaimTypes.Email);

        var profile = await sender.Send(
            new GetCurrentUserQuery(tenantId, userId, displayName, email)).ConfigureAwait(false);
        return Results.Ok(profile);
    }

    private static async Task<IResult> GetCurrentUserWalletAsync(
        HttpContext httpContext,
        ISender sender,
        string tenantId)
    {
        var userId = httpContext.GetUserId();
        tenantId = httpContext.GetTenantId(tenantId);

        var wallet = await sender.Send(new GetCurrentUserWalletQuery(tenantId, userId)).ConfigureAwait(false);
        return Results.Ok(wallet);
    }

    private static async Task<IResult> DepositFundsAsync(
        HttpContext httpContext,
        ISender sender,
        string tenantId,
        [FromBody] DepositFundsRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        var userId = httpContext.GetUserId();
        tenantId = httpContext.GetTenantId(tenantId);

        var wallet = await sender.Send(
            DepositFundsCommand.FromRequest(tenantId, userId, request)).ConfigureAwait(false);

        return Results.Ok(wallet);
    }

    private static async Task<IResult> UpdatePreferredCurrencyAsync(
        HttpContext httpContext,
        ISender sender,
        string tenantId,
        [FromBody] UpdatePreferredCurrencyRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        var userId = httpContext.GetUserId();
        tenantId = httpContext.GetTenantId(tenantId);

        var profile = await sender.Send(
            new UpdatePreferredCurrencyCommand(tenantId, userId, request.Currency)).ConfigureAwait(false);

        return Results.Ok(profile);
    }

    private static async Task<IResult> LinkPayoutAccountAsync(
        HttpContext httpContext,
        ISender sender,
        string tenantId,
        [FromBody] LinkPayoutAccountRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        var userId = httpContext.GetUserId();
        tenantId = httpContext.GetTenantId(tenantId);

        var profile = await sender.Send(
            new LinkPayoutAccountCommand(tenantId, userId, request.Provider, request.AccountId))
            .ConfigureAwait(false);

        return Results.Ok(profile);
    }

    private static async Task<IResult> VerifyPayoutAccountAsync(
        HttpContext httpContext,
        ISender sender,
        string tenantId)
    {
        var userId = httpContext.GetUserId();
        tenantId = httpContext.GetTenantId(tenantId);

        var profile = await sender.Send(new VerifyPayoutAccountCommand(tenantId, userId)).ConfigureAwait(false);
        return Results.Ok(profile);
    }
}
