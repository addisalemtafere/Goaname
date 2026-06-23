using Goaname.Application.Common;
using Goaname.Contracts.Markets;

namespace Goaname.Application.Features.Markets.CloseMarket;

public sealed record CloseMarketCommand(string TenantId, Guid MarketId) : ICommand<MarketDto>;
