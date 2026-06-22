using FluentValidation;
using Goaname.Application.Common.Validators;
using Goaname.Domain.Constants;

namespace Goaname.Application.Features.Tenants.RemoveTenantCategory;

public sealed class RemoveTenantCategoryCommandValidator : AbstractValidator<RemoveTenantCategoryCommand>
{
    public RemoveTenantCategoryCommandValidator()
    {
        this.ApplyTenantIdRule(x => x.TenantId);

        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(MarketConstraints.CategoryMaxLength);
    }
}
