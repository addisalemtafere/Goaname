using FluentValidation;

namespace Goaname.Application.Features.Users.DepositFunds;

public sealed class DepositFundsCommandValidator : AbstractValidator<DepositFundsCommand>
{
    public DepositFundsCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.Amount)
            .GreaterThan(0)
            .WithMessage("Deposit amount must be greater than zero.")
            .LessThanOrEqualTo(100_000)
            .WithMessage("Deposit amount must not exceed 100,000.");
    }
}
