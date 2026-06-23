using Goaname.Application.Auth;
using Goaname.Application.Features.Tenants.GetTenant;
using Goaname.Application.Features.Tenants.InitializeTenant;
using Goaname.Contracts.Auth;
using Goaname.Domain.Auth;
using Goaname.Grains.Interfaces;
using MediatR;

namespace Goaname.Application.Features.Auth.Register;

public sealed class RegisterCommandHandler(
    IGrainFactory grainFactory,
    ISender sender,
    IJwtTokenIssuer tokenIssuer)
    : IRequestHandler<RegisterCommand, AuthResponse>
{
    public async Task<AuthResponse> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var tenant = await sender.Send(new GetTenantQuery(request.TenantId), cancellationToken).ConfigureAwait(false);
        if (string.IsNullOrWhiteSpace(tenant.TenantId))
        {
            tenant = await sender.Send(
                new InitializeTenantCommand(request.TenantId, "Demo Markets", "USD"),
                cancellationToken).ConfigureAwait(false);
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

        var token = tokenIssuer.IssueToken(userId, request.TenantId, request.DisplayName, email);
        return ToAuthResponse(token);
    }

    internal static AuthResponse ToAuthResponse(AuthTokenResult token) =>
        new()
        {
            AccessToken = token.AccessToken,
            UserId = token.UserId,
            TenantId = token.TenantId,
            DisplayName = token.DisplayName,
            Email = token.Email,
            ExpiresAt = token.ExpiresAt,
        };
}
