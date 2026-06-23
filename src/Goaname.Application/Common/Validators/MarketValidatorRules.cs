using FluentValidation;
using System.Linq.Expressions;

namespace Goaname.Application.Common.Validators;

internal static class MarketValidatorRules
{
    public static void ApplyTenantAndMarketIdRules<T>(
        this AbstractValidator<T> validator,
        Expression<Func<T, string>> tenantIdSelector,
        Expression<Func<T, Guid>> marketIdSelector)
    {
        ArgumentNullException.ThrowIfNull(validator);

        validator.RuleFor(tenantIdSelector).ValidTenantId();
        validator.RuleFor(marketIdSelector).ValidMarketId();
    }

    public static void ApplyTenantIdRule<T>(
        this AbstractValidator<T> validator,
        Expression<Func<T, string>> tenantIdSelector)
    {
        ArgumentNullException.ThrowIfNull(validator);
        validator.RuleFor(tenantIdSelector).ValidTenantId();
    }
}
