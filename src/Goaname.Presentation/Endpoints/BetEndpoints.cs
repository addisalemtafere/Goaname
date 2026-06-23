using Goaname.Application.Features.Bets.PlaceBet;
using Goaname.Contracts.Bets;
using Goaname.Presentation.Configuration;
using Goaname.Presentation.Extensions;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Goaname.Presentation.Endpoints;

internal static class BetEndpoints
{
    public static IEndpointRouteBuilder MapBetEndpoints(this IEndpointRouteBuilder app)
    {
        ArgumentNullException.ThrowIfNull(app);

        var group = app.MapGroup("/api/tenants/{tenantId}")
            .WithTags("Bets");

        group.MapPost("/markets/{marketId:guid}/bets", PlaceBetAsync)
            .RequireAuthorization(GoanamePolicies.AuthenticatedUser);

        return app;
    }

    private static async Task<IResult> PlaceBetAsync(
        HttpContext httpContext,
        ISender sender,
        string tenantId,
        Guid marketId,
        [FromBody] PlaceBetBodyRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        var userId = httpContext.GetUserId();
        tenantId = httpContext.GetTenantId(tenantId);

        var response = await sender.Send(
            PlaceBetCommand.FromRequest(tenantId, userId, marketId, request)).ConfigureAwait(false);

        return Results.Created(
            $"/api/tenants/{tenantId}/markets/{marketId}/bets/{response.BetSlipId}",
            response);
    }
}
