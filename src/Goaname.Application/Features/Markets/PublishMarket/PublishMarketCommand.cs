using Goaname.Application.Common;
using Goaname.Contracts.Markets;

namespace Goaname.Application.Features.Markets.PublishMarket;

public sealed record PublishMarketCommand(string TenantId, Guid MarketId) : ICommand<MarketDto>;
