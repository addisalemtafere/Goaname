using Goaname.Application.Common;
using Goaname.Contracts.Markets;

namespace Goaname.Application.Features.Markets.ListAdminMarkets;

public sealed record ListAdminMarketsQuery(string TenantId) : IQuery<IReadOnlyList<MarketDto>>;
