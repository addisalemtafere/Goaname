using FluentValidation;
using Goaname.Application.Common.Validators;

namespace Goaname.Application.Features.Markets.GetMarketOdds;

public sealed class GetMarketOddsQueryValidator : AbstractValidator<GetMarketOddsQuery>
{
    public GetMarketOddsQueryValidator()
    {
        this.ApplyTenantAndMarketIdRules(x => x.TenantId, x => x.MarketId);
    }
}
