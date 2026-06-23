using Goaname.Application.Common;
using Goaname.Contracts.Users;

namespace Goaname.Application.Features.Users.DepositFunds;

public sealed record DepositFundsCommand(
    string TenantId,
    Guid UserId,
    decimal Amount) : ICommand<WalletDto>
{
    public static DepositFundsCommand FromRequest(string tenantId, Guid userId, DepositFundsRequest request)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(tenantId);
        ArgumentNullException.ThrowIfNull(request);

        return new DepositFundsCommand(tenantId.Trim(), userId, request.Amount);
    }
}
