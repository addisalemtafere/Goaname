namespace Goaname.Contracts.Users;

public sealed record UpdatePreferredCurrencyRequest
{
    public required string Currency { get; init; }
}
