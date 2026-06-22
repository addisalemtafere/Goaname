using FluentValidation;

namespace Goaname.Application.Common.Validators;

internal static class BetFieldValidatorExtensions
{
    public static IRuleBuilderOptions<T, Guid> ValidUserId<T>(this IRuleBuilder<T, Guid> ruleBuilder) =>
        ruleBuilder.NotEmpty().WithMessage("User id is required.");

    public static IRuleBuilderOptions<T, decimal> ValidBetAmount<T>(this IRuleBuilder<T, decimal> ruleBuilder) =>
        ruleBuilder
            .GreaterThan(0)
            .WithMessage("Bet amount must be greater than zero.");

    public static IRuleBuilderOptions<T, decimal> ValidOddsAtPlacement<T>(this IRuleBuilder<T, decimal> ruleBuilder) =>
        ruleBuilder
            .GreaterThan(0)
            .WithMessage("Odds at placement must be greater than zero.");

    public static IRuleBuilderOptions<T, decimal> ValidSharesReceived<T>(this IRuleBuilder<T, decimal> ruleBuilder) =>
        ruleBuilder
            .GreaterThan(0)
            .WithMessage("Shares received must be greater than zero.");

    public static IRuleBuilderOptions<T, Guid> ValidBetSlipId<T>(this IRuleBuilder<T, Guid> ruleBuilder) =>
        ruleBuilder.NotEmpty().WithMessage("Bet slip id is required.");
}
