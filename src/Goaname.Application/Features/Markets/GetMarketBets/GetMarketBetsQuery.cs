using Goaname.Application.Common;
using Goaname.Contracts.Markets;

namespace Goaname.Application.Features.Markets.GetMarketBets;

public sealed record GetMarketBetsQuery(string TenantId, Guid MarketId) : IQuery<MarketBetsDto>;
