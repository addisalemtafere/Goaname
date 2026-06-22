namespace Goaname.Contracts.Users;

public sealed record LinkPayoutAccountRequest
{
    public required string Provider { get; init; }
    public required string AccountId { get; init; }
}
