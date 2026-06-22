using Goaname.Application.Common;
using Goaname.Contracts.Users;

namespace Goaname.Application.Features.Users.GetCurrentUser;

public sealed record GetCurrentUserQuery(
    string TenantId,
    Guid UserId,
    string? DisplayName = null,
    string? Email = null) : IQuery<UserProfileDto>;
