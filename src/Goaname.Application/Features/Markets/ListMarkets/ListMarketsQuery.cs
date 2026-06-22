using Goaname.Application.Common;
using Goaname.Contracts.Markets;

namespace Goaname.Application.Features.Markets.ListMarkets;

public sealed record ListMarketsQuery(string TenantId) : IQuery<IReadOnlyList<MarketDto>>;
