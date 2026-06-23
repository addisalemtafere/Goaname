using FluentValidation;

namespace Goaname.Application.Common.Validators;

internal static class MarketRequestValidatorExtensions
{
    public static IRuleBuilderOptions<T, string> ValidTenantId<T>(this IRuleBuilder<T, string> ruleBuilder) =>
        ruleBuilder.NotEmpty().MaximumLength(Goaname.Domain.Constants.MarketConstraints.TenantIdMaxLength);

    public static IRuleBuilderOptions<T, Guid> ValidMarketId<T>(this IRuleBuilder<T, Guid> ruleBuilder) =>
        ruleBuilder.NotEmpty();
}
