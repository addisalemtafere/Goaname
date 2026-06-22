using FluentValidation;
using Goaname.Domain.Constants;
using Goaname.Domain.Rules;

namespace Goaname.Application.Features.Users.LinkPayoutAccount;

public sealed class LinkPayoutAccountCommandValidator : AbstractValidator<LinkPayoutAccountCommand>
{
    private static readonly string[] AllowedProviders =
    [
        PayoutProviders.MobileMoney,
        PayoutProviders.BankAccount,
    ];

    public LinkPayoutAccountCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.Provider)
            .NotEmpty()
            .Must(provider => AllowedProviders.Contains(provider, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Provider must be one of: {string.Join(", ", AllowedProviders)}.");
        RuleFor(x => x.AccountId).NotEmpty();
        RuleFor(x => x)
            .Custom((command, context) =>
            {
                try
                {
                    PayoutAccountRules.Validate(command.Provider, command.AccountId);
                }
                catch (ArgumentException exception)
                {
                    context.AddFailure(nameof(command.AccountId), exception.Message);
                }
            });
    }
}
