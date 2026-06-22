using FluentValidation;
using Goaname.Application.Common.Validators;

namespace Goaname.Application.Features.Markets.ResolveMarket;

public sealed class ResolveMarketCommandValidator : AbstractValidator<ResolveMarketCommand>
{
    public ResolveMarketCommandValidator()
    {
        this.ApplyTenantAndMarketIdRules(x => x.TenantId, x => x.MarketId);
        RuleFor(x => x.WinningOutcome).IsInEnum();
    }
}
