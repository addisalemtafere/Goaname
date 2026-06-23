using FluentValidation;
using Goaname.Application.Common.Validators;
using Goaname.Domain.Constants;

namespace Goaname.Application.Features.Tenants.AddTenantCategory;

public sealed class AddTenantCategoryCommandValidator : AbstractValidator<AddTenantCategoryCommand>
{
    public AddTenantCategoryCommandValidator()
    {
        this.ApplyTenantIdRule(x => x.TenantId);

        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(MarketConstraints.CategoryMaxLength);
    }
}
