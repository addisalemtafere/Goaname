using FluentValidation;

namespace Goaname.Application.Features.Tenants.InitializeTenant;

public sealed class InitializeTenantCommandValidator : AbstractValidator<InitializeTenantCommand>
{
    public InitializeTenantCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Currency).NotEmpty().Length(3);
    }
}
