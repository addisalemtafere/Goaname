using FluentValidation;
using Goaname.Application.Common.Validators;

namespace Goaname.Application.Features.Markets.ListMarkets;

public sealed class ListMarketsQueryValidator : AbstractValidator<ListMarketsQuery>
{
    public ListMarketsQueryValidator()
    {
        this.ApplyTenantIdRule(x => x.TenantId);
    }
}
