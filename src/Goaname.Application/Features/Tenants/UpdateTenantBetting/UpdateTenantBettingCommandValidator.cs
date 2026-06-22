using FluentValidation;

namespace Goaname.Application.Features.Tenants.UpdateTenantBetting;

public sealed class UpdateTenantBettingCommandValidator : AbstractValidator<UpdateTenantBettingCommand>
{
    public UpdateTenantBettingCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty().MaximumLength(100);
    }
}
