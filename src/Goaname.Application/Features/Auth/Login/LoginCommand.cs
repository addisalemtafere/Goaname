using Goaname.Application.Auth;
using Goaname.Application.Common;
using Goaname.Contracts.Auth;

namespace Goaname.Application.Features.Auth.Login;

public sealed record LoginCommand(string TenantId, string Email, string Password) : ICommand<AuthResponse>;
