using FluentValidation;
using Goaname.Application.Common.Validators;

namespace Goaname.Application.Features.Tenants.ListTenantCategories;

public sealed class ListTenantCategoriesQueryValidator : AbstractValidator<ListTenantCategoriesQuery>
{
    public ListTenantCategoriesQueryValidator()
    {
        this.ApplyTenantIdRule(x => x.TenantId);
    }
}
