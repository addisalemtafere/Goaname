using FluentValidation;
using Goaname.Application.Features.Bets.PlaceBet;

namespace Goaname.Application.Common.Validators;

internal static class BetValidatorRules
{
    public static void ApplyPlaceBetCommandRules(this AbstractValidator<PlaceBetCommand> validator)
    {
        ArgumentNullException.ThrowIfNull(validator);

        validator.RuleFor(x => x.TenantId).ValidTenantId();
        validator.RuleFor(x => x.UserId).ValidUserId();
        validator.RuleFor(x => x.MarketId).ValidMarketId();
        validator.RuleFor(x => x.Outcome).IsInEnum();
        validator.RuleFor(x => x.Amount).ValidBetAmount();
    }
}
