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
        group.MapGet("/admin/markets", ListAdminMarketsAsync);
        group.MapGet("/admin/markets/{marketId:guid}/bets", GetMarketBetsAsync);
        group.MapPost("/admin/markets", CreateMarketAsync);
        group.MapPost("/admin/markets/{marketId:guid}/publish", PublishMarketAsync);
        group.MapPost("/admin/markets/{marketId:guid}/close", CloseMarketAsync);
        group.MapPost("/admin/markets/{marketId:guid}/resolve", ResolveMarketAsync);
        group.MapPost("/admin/markets/{marketId:guid}/settle", SettleMarketAsync);

        return app;
    }

    private static Task<IResult> ListMarketsAsync(ISender sender, string tenantId) =>
        SendOkAsync(sender, new ListMarketsQuery(NormalizeTenantId(tenantId)), Results.Ok);

    private static Task<IResult> GetMarketAsync(ISender sender, string tenantId, Guid marketId) =>
        SendOkAsync(sender, new GetMarketQuery(NormalizeTenantId(tenantId), marketId), Results.Ok);

    private static Task<IResult> GetMarketOddsAsync(ISender sender, string tenantId, Guid marketId) =>
        SendOkAsync(sender, new GetMarketOddsQuery(NormalizeTenantId(tenantId), marketId), Results.Ok);

    private static Task<IResult> ListAdminMarketsAsync(ISender sender, string tenantId) =>
        SendOkAsync(sender, new ListAdminMarketsQuery(NormalizeTenantId(tenantId)), Results.Ok);

    private static Task<IResult> GetMarketBetsAsync(ISender sender, string tenantId, Guid marketId) =>
        SendOkAsync(sender, new GetMarketBetsQuery(NormalizeTenantId(tenantId), marketId), Results.Ok);

    private static async Task<IResult> CreateMarketAsync(
        ISender sender,
        string tenantId,
        CreateMarketRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        var normalizedTenantId = NormalizeTenantId(tenantId);
        var market = await sender
            .Send(CreateMarketCommand.FromRequest(normalizedTenantId, request))
            .ConfigureAwait(false);

        return Results.Created($"/api/tenants/{normalizedTenantId}/markets/{market.Id}", market);
    }

    private static Task<IResult> PublishMarketAsync(ISender sender, string tenantId, Guid marketId) =>
        SendOkAsync(sender, new PublishMarketCommand(NormalizeTenantId(tenantId), marketId), Results.Ok);

    private static Task<IResult> CloseMarketAsync(ISender sender, string tenantId, Guid marketId) =>
        SendOkAsync(sender, new CloseMarketCommand(NormalizeTenantId(tenantId), marketId), Results.Ok);

    private static async Task<IResult> ResolveMarketAsync(
        ISender sender,
        string tenantId,
        Guid marketId,
        ResolveMarketRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        return await SendOkAsync(
            sender,
            ResolveMarketCommand.FromRequest(NormalizeTenantId(tenantId), marketId, request),
            Results.Ok).ConfigureAwait(false);
    }

    private static Task<IResult> SettleMarketAsync(ISender sender, string tenantId, Guid marketId) =>
        SendOkAsync(sender, new SettleMarketCommand(NormalizeTenantId(tenantId), marketId), Results.Ok);

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
