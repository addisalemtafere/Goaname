using Goaname.Application.Common;
using Goaname.Contracts.Markets;

namespace Goaname.Application.Features.Markets.GetMarketOdds;

public sealed record GetMarketOddsQuery(string TenantId, Guid MarketId) : IQuery<OddsSnapshot>;
