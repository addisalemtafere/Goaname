using Goaname.Application.Common.Validators;
using FluentValidation;

namespace Goaname.Application.Features.Markets.SettleMarket;

public sealed class SettleMarketCommandValidator : AbstractValidator<SettleMarketCommand>
{
    public SettleMarketCommandValidator()
    {
        this.ApplyTenantAndMarketIdRules(x => x.TenantId, x => x.MarketId);
    }
}
