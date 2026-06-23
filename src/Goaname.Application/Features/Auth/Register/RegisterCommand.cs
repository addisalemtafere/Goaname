using Goaname.Application.Common;
using Goaname.Contracts.Auth;

namespace Goaname.Application.Features.Auth.Register;

public sealed record RegisterCommand(
    string TenantId,
    string DisplayName,
    string Email,
    string Password) : ICommand<RegisteredUserResponse>;
