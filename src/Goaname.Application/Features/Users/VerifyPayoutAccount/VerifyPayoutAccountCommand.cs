using Goaname.Application.Common;
using Goaname.Contracts.Users;

namespace Goaname.Application.Features.Users.VerifyPayoutAccount;

public sealed record VerifyPayoutAccountCommand(string TenantId, Guid UserId) : ICommand<UserProfileDto>;
