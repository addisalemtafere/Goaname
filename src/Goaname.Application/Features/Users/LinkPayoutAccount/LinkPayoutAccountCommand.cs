using Goaname.Application.Common;
using Goaname.Contracts.Users;

namespace Goaname.Application.Features.Users.LinkPayoutAccount;

public sealed record LinkPayoutAccountCommand(
    string TenantId,
    Guid UserId,
    string Provider,
    string AccountId) : ICommand<UserProfileDto>;
