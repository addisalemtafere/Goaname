using FluentValidation;
using Goaname.Application.Common.Validators;

namespace Goaname.Application.Features.Markets.GetMarket;

public sealed class GetMarketQueryValidator : AbstractValidator<GetMarketQuery>
{
    public GetMarketQueryValidator()
    {
        this.ApplyTenantAndMarketIdRules(x => x.TenantId, x => x.MarketId);
    }
}
