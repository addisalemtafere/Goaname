using FluentValidation;
using Goaname.Application.Common.Validators;

namespace Goaname.Application.Features.Markets.ListAdminMarkets;

public sealed class ListAdminMarketsQueryValidator : AbstractValidator<ListAdminMarketsQuery>
{
    public ListAdminMarketsQueryValidator()
    {
        this.ApplyTenantIdRule(x => x.TenantId);
    }
}
