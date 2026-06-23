using FluentValidation;
using Goaname.Application.Common.Validators;

namespace Goaname.Application.Features.Markets.PublishMarket;

public sealed class PublishMarketCommandValidator : AbstractValidator<PublishMarketCommand>
{
    public PublishMarketCommandValidator()
    {
        this.ApplyTenantAndMarketIdRules(x => x.TenantId, x => x.MarketId);
    }
}
