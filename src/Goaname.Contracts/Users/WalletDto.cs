using Goaname.Domain.Enums;

namespace Goaname.Contracts.Users;

public sealed record WalletDto
{
    public required Guid UserId { get; init; }
    public required string Currency { get; init; }
    public decimal Balance { get; init; }
    public decimal TotalDeposited { get; init; }
    public decimal TotalWithdrawn { get; init; }
    public decimal TotalWon { get; init; }
    public decimal TotalLost { get; init; }
    public WalletStatus Status { get; init; }
    public DateTimeOffset LastUpdated { get; init; }
}
