using Goaname.Application.Auth;
using Goaname.Application.Features.Tenants.GetTenant;
using Goaname.Contracts.Auth;
using Goaname.Domain.Auth;
using Goaname.Domain.Exceptions;
using Goaname.Grains.Interfaces;
using MediatR;

namespace Goaname.Application.Features.Auth.Register;

public sealed class RegisterCommandHandler(
    IGrainFactory grainFactory,
    ISender sender,
    IUserRoleResolver roleResolver)
    : IRequestHandler<RegisterCommand, RegisteredUserResponse>
{
    public async Task<RegisteredUserResponse> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var tenant = await sender.Send(new GetTenantQuery(request.TenantId), cancellationToken).ConfigureAwait(false);
        if (string.IsNullOrWhiteSpace(tenant.TenantId))
        {
            throw new BusinessRuleException("Tenant is not initialized. A platform administrator must create the tenant first.");
        }

        var userId = Guid.NewGuid();
        var email = request.Email.Trim().ToUpperInvariant();
        var authGrain = grainFactory.GetGrain<IUserAuthGrain>(GrainKeys.UserAuth(request.TenantId, email));

        await authGrain.RegisterAsync(
            userId,
            request.DisplayName,
            email,
            PasswordHasher.Hash(request.Password)).ConfigureAwait(false);

        var userGrain = grainFactory.GetGrain<IUserGrain>(GrainKeys.User(request.TenantId, userId));
        await userGrain.InitializeAsync(
            userId,
            request.TenantId,
            request.DisplayName,
            email,
            tenant.Currency).ConfigureAwait(false);

        var userCatalog = grainFactory.GetGrain<IUserCatalogGrain>(GrainKeys.UserCatalog(request.TenantId));
        await userCatalog.RegisterAsync(userId).ConfigureAwait(false);

        var roles = roleResolver.Resolve(request.TenantId, email);
        return new RegisteredUserResponse
        {
            UserId = userId,
            TenantId = request.TenantId,
            DisplayName = request.DisplayName,
            Email = email,
            Roles = roles,
        };
    }
}
