using FluentValidation;
using Goaname.Application.Common.Validators;

namespace Goaname.Application.Features.Markets.CloseMarket;

public sealed class CloseMarketCommandValidator : AbstractValidator<CloseMarketCommand>
{
    public CloseMarketCommandValidator()
    {
        this.ApplyTenantAndMarketIdRules(x => x.TenantId, x => x.MarketId);
    }
}
