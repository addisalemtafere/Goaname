using FluentValidation;
using Goaname.Application.Common.Validators;

namespace Goaname.Application.Features.Bets.GetMyBets;

public sealed class GetMyBetsQueryValidator : AbstractValidator<GetMyBetsQuery>
{
    public GetMyBetsQueryValidator()
    {
        this.ApplyTenantIdRule(x => x.TenantId);
        RuleFor(x => x.UserId).ValidUserId();
        RuleFor(x => x.Limit).InclusiveBetween(1, 200);
    }
}
