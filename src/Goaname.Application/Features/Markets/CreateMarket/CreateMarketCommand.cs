using Goaname.Application.Common;
using Goaname.Contracts.Markets;

namespace Goaname.Application.Features.Markets.CreateMarket;

public sealed record CreateMarketCommand(
    string TenantId,
    string Title,
    string Category,
    DateTimeOffset TradingEndsAt,
    decimal? LiquidityParameter) : ICommand<MarketDto>
{
    public static CreateMarketCommand FromRequest(string tenantId, CreateMarketRequest request)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(tenantId);
        ArgumentNullException.ThrowIfNull(request);

        return new CreateMarketCommand(
            tenantId.Trim(),
            request.Title,
            request.Category,
            request.TradingEndsAt,
            request.LiquidityParameter).Normalize();
    }

    public CreateMarketCommand Normalize() =>
        this with
        {
            TenantId = TenantId.Trim(),
            Title = Title.Trim(),
            Category = Category.Trim(),
        };
}
