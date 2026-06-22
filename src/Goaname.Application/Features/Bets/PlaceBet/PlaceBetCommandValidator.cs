using FluentValidation;
using Goaname.Application.Common.Validators;
using Goaname.Application.Features.Bets.PlaceBet;

namespace Goaname.Application.Features.Bets.PlaceBet;

public sealed class PlaceBetCommandValidator : AbstractValidator<PlaceBetCommand>
{
    public PlaceBetCommandValidator()
    {
        this.ApplyPlaceBetCommandRules();
    }
}
