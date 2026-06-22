using Goaname.Application.Auth;
using Goaname.Application.Features.Auth.Register;
using Goaname.Contracts.Auth;
using Goaname.Domain.Exceptions;
using Goaname.Grains.Interfaces;
using MediatR;

namespace Goaname.Application.Features.Auth.Login;

public sealed class LoginCommandHandler(IGrainFactory grainFactory, IJwtTokenIssuer tokenIssuer)
    : IRequestHandler<LoginCommand, AuthResponse>
{
    public async Task<AuthResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var email = request.Email.Trim().ToUpperInvariant();
        var authGrain = grainFactory.GetGrain<IUserAuthGrain>(GrainKeys.UserAuth(request.TenantId, email));
        var credentials = await authGrain.GetStateAsync().ConfigureAwait(false);

        if (string.IsNullOrEmpty(credentials.Email))
        {
            throw new BusinessRuleException("Invalid email or password.");
        }

        var isValid = await authGrain.ValidatePasswordAsync(request.Password).ConfigureAwait(false);
        if (!isValid)
        {
            throw new BusinessRuleException("Invalid email or password.");
        }

        var token = tokenIssuer.IssueToken(
            credentials.UserId,
            credentials.TenantId,
            credentials.DisplayName,
            credentials.Email);

        return RegisterCommandHandler.ToAuthResponse(token);
    }
}
