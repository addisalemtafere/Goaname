using Goaname.Application.Features.Markets.CloseMarket;
using Goaname.Application.Features.Markets.CreateMarket;
using Goaname.Application.Features.Markets.GetMarket;
using Goaname.Application.Features.Markets.GetMarketBets;
using Goaname.Application.Features.Markets.GetMarketOdds;
using Goaname.Application.Features.Markets.ListAdminMarkets;
using Goaname.Application.Features.Markets.ListMarkets;
using Goaname.Application.Features.Markets.PublishMarket;
using Goaname.Application.Features.Markets.ResolveMarket;
using Goaname.Application.Features.Markets.SettleMarket;
using Goaname.Contracts.Markets;
using Goaname.Presentation.Configuration;
using Goaname.Presentation.Extensions;
using MediatR;

namespace Goaname.Presentation.Endpoints;

internal static class MarketEndpoints
{
    public static IEndpointRouteBuilder MapMarketEndpoints(this IEndpointRouteBuilder app)
    {
        ArgumentNullException.ThrowIfNull(app);

        var group = app.MapGroup("/api/tenants/{tenantId}").WithTags("Markets");

        group.MapGet("/markets", ListMarketsAsync);
        group.MapGet("/markets/{marketId:guid}", GetMarketAsync);
        group.MapGet("/markets/{marketId:guid}/odds", GetMarketOddsAsync);

        var admin = group.MapGroup("/admin")
            .RequireAuthorization(GoanamePolicies.TenantAdmin);

        admin.MapGet("/markets", ListAdminMarketsAsync);
        admin.MapGet("/markets/{marketId:guid}/bets", GetMarketBetsAsync);
        admin.MapPost("/markets", CreateMarketAsync);
        admin.MapPost("/markets/{marketId:guid}/publish", PublishMarketAsync);
        admin.MapPost("/markets/{marketId:guid}/close", CloseMarketAsync);
        admin.MapPost("/markets/{marketId:guid}/resolve", ResolveMarketAsync);
        admin.MapPost("/markets/{marketId:guid}/settle", SettleMarketAsync);

        return app;
    }

    private static Task<IResult> ListMarketsAsync(ISender sender, string tenantId) =>
        SendOkAsync(sender, new ListMarketsQuery(NormalizeTenantId(tenantId)), Results.Ok);

    private static Task<IResult> GetMarketAsync(ISender sender, string tenantId, Guid marketId) =>
        SendOkAsync(sender, new GetMarketQuery(NormalizeTenantId(tenantId), marketId), Results.Ok);

    private static Task<IResult> GetMarketOddsAsync(ISender sender, string tenantId, Guid marketId) =>
        SendOkAsync(sender, new GetMarketOddsQuery(NormalizeTenantId(tenantId), marketId), Results.Ok);

    private static Task<IResult> ListAdminMarketsAsync(HttpContext httpContext, ISender sender, string tenantId) =>
        SendOkAsync(
            sender,
            new ListAdminMarketsQuery(httpContext.GetTenantId(tenantId)),
            Results.Ok);

    private static Task<IResult> GetMarketBetsAsync(HttpContext httpContext, ISender sender, string tenantId, Guid marketId) =>
        SendOkAsync(
            sender,
            new GetMarketBetsQuery(httpContext.GetTenantId(tenantId), marketId),
            Results.Ok);

    private static async Task<IResult> CreateMarketAsync(
        HttpContext httpContext,
        ISender sender,
        string tenantId,
        CreateMarketRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        var normalizedTenantId = httpContext.GetTenantId(tenantId);
        var market = await sender
            .Send(CreateMarketCommand.FromRequest(normalizedTenantId, request))
            .ConfigureAwait(false);

        return Results.Created($"/api/tenants/{normalizedTenantId}/markets/{market.Id}", market);
    }

    private static Task<IResult> PublishMarketAsync(HttpContext httpContext, ISender sender, string tenantId, Guid marketId) =>
        SendOkAsync(sender, new PublishMarketCommand(httpContext.GetTenantId(tenantId), marketId), Results.Ok);

    private static Task<IResult> CloseMarketAsync(HttpContext httpContext, ISender sender, string tenantId, Guid marketId) =>
        SendOkAsync(sender, new CloseMarketCommand(httpContext.GetTenantId(tenantId), marketId), Results.Ok);

    private static async Task<IResult> ResolveMarketAsync(
        HttpContext httpContext,
        ISender sender,
        string tenantId,
        Guid marketId,
        ResolveMarketRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        return await SendOkAsync(
            sender,
            ResolveMarketCommand.FromRequest(httpContext.GetTenantId(tenantId), marketId, request),
            Results.Ok).ConfigureAwait(false);
    }

    private static Task<IResult> SettleMarketAsync(HttpContext httpContext, ISender sender, string tenantId, Guid marketId) =>
        SendOkAsync(sender, new SettleMarketCommand(httpContext.GetTenantId(tenantId), marketId), Results.Ok);

    private static async Task<IResult> SendOkAsync<TResponse>(
        ISender sender,
        IRequest<TResponse> request,
        Func<TResponse, IResult> ok)
    {
        var response = await sender.Send(request).ConfigureAwait(false);
        return ok(response);
    }

    private static string NormalizeTenantId(string tenantId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(tenantId);
        return tenantId.Trim();
    }
}
