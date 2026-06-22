using FluentValidation;
using Goaname.Domain.Constants;

namespace Goaname.Application.Common.Validators;

internal static class MarketFieldValidatorExtensions
{
    public static IRuleBuilderOptions<T, string> ValidMarketTitle<T>(this IRuleBuilder<T, string> ruleBuilder) =>
        ruleBuilder
            .Must(title => !string.IsNullOrWhiteSpace(title))
            .WithMessage("Title is required.")
            .Must(title => title.Trim().Length >= MarketConstraints.TitleMinLength)
            .WithMessage($"Title must be at least {MarketConstraints.TitleMinLength} characters.")
            .Must(title => title.Trim().Length <= MarketConstraints.TitleMaxLength)
            .WithMessage($"Title must be at most {MarketConstraints.TitleMaxLength} characters.");

    public static IRuleBuilderOptions<T, string> ValidMarketCategory<T>(this IRuleBuilder<T, string> ruleBuilder) =>
        ruleBuilder
            .Must(category => !string.IsNullOrWhiteSpace(category))
            .WithMessage("Category is required.")
            .Must(category => category.Trim().Length <= MarketConstraints.CategoryMaxLength)
            .WithMessage($"Category must be at most {MarketConstraints.CategoryMaxLength} characters.");
}
