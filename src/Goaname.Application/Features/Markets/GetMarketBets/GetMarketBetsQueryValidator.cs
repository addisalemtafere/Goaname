using Goaname.Application.Common.Validators;
using FluentValidation;

namespace Goaname.Application.Features.Markets.GetMarketBets;

public sealed class GetMarketBetsQueryValidator : AbstractValidator<GetMarketBetsQuery>
{
    public GetMarketBetsQueryValidator()
    {
        this.ApplyTenantAndMarketIdRules(x => x.TenantId, x => x.MarketId);
    }
}
