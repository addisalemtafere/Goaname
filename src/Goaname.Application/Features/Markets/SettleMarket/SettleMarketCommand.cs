using Goaname.Application.Common;
using Goaname.Contracts.Markets;

namespace Goaname.Application.Features.Markets.SettleMarket;

public sealed record SettleMarketCommand(string TenantId, Guid MarketId) : ICommand<MarketDto>;
