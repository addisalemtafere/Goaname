using FluentValidation;
using Goaname.Application.Common.Validators;

namespace Goaname.Application.Features.Markets.CreateMarket;

public sealed class CreateMarketCommandValidator : AbstractValidator<CreateMarketCommand>
{
    public CreateMarketCommandValidator()
    {
        RuleFor(x => x.TenantId).ValidTenantId();
        RuleFor(x => x.Title).ValidMarketTitle();
        RuleFor(x => x.Category).ValidMarketCategory();
        RuleFor(x => x.TradingEndsAt)
            .GreaterThan(_ => DateTimeOffset.UtcNow)
            .WithMessage("Trading end date must be in the future.");
        RuleFor(x => x.LiquidityParameter)
            .GreaterThan(0)
            .When(x => x.LiquidityParameter.HasValue)
            .WithMessage("Liquidity parameter must be greater than zero.");
    }
}
