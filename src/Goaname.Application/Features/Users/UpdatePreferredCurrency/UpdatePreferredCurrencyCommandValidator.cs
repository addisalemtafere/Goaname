using FluentValidation;

namespace Goaname.Application.Features.Users.UpdatePreferredCurrency;

public sealed class UpdatePreferredCurrencyCommandValidator : AbstractValidator<UpdatePreferredCurrencyCommand>
{
    private static readonly string[] AllowedCurrencies = ["USD", "KES"];

    public UpdatePreferredCurrencyCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.Currency)
            .NotEmpty()
            .Must(currency => AllowedCurrencies.Contains(currency.ToUpperInvariant()))
            .WithMessage("Currency must be USD or KES.");
    }
}
