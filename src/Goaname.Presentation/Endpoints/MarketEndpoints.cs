using Goaname.Application.Features.Markets.CreateMarket;
using Goaname.Application.Features.Markets.GetMarket;
using Goaname.Application.Features.Markets.GetMarketOdds;
using Goaname.Application.Features.Markets.ListAdminMarkets;
using Goaname.Application.Features.Markets.ListMarkets;
using Goaname.Application.Features.Markets.PublishMarket;
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
        group.MapPost("/admin/markets", CreateMarketAsync);
        group.MapPost("/admin/markets/{marketId:guid}/publish", PublishMarketAsync);

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
