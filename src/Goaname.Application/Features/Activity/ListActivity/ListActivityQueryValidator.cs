using FluentValidation;
using Goaname.Application.Common.Validators;

namespace Goaname.Application.Features.Activity.ListActivity;

public sealed class ListActivityQueryValidator : AbstractValidator<ListActivityQuery>
{
    public ListActivityQueryValidator()
    {
        this.ApplyTenantIdRule(x => x.TenantId);
        RuleFor(x => x.Limit).InclusiveBetween(1, 200);
    }
}
