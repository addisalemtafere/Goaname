using Goaname.Application.Common;
using Goaname.Contracts.Users;

namespace Goaname.Application.Features.Users.GetCurrentUserWallet;

public sealed record GetCurrentUserWalletQuery(string TenantId, Guid UserId) : IQuery<WalletDto>;
