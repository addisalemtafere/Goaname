using FluentValidation;
using Goaname.Application.Common.Validators;

namespace Goaname.Application.Features.Leaderboard.GetLeaderboard;

public sealed class GetLeaderboardQueryValidator : AbstractValidator<GetLeaderboardQuery>
{
    public GetLeaderboardQueryValidator()
    {
        this.ApplyTenantIdRule(x => x.TenantId);
        RuleFor(x => x.Limit).InclusiveBetween(1, 100);
    }
}
