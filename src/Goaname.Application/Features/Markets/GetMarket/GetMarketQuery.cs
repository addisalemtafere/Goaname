using Goaname.Application.Common;
using Goaname.Contracts.Markets;

namespace Goaname.Application.Features.Markets.GetMarket;

public sealed record GetMarketQuery(string TenantId, Guid MarketId) : IQuery<MarketDto>;
