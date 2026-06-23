namespace Goaname.Contracts.Users;

public sealed record DepositFundsRequest
{
    public required decimal Amount { get; init; }
}
