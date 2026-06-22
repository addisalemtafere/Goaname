using Goaname.Application.Common;
using Goaname.Contracts.Users;

namespace Goaname.Application.Features.Users.UpdatePreferredCurrency;

public sealed record UpdatePreferredCurrencyCommand(
    string TenantId,
    Guid UserId,
    string Currency) : ICommand<UserProfileDto>;
