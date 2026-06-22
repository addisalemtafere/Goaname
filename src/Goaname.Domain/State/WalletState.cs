using Goaname.Domain.Enums;
using Orleans;

namespace Goaname.Domain.State;

[GenerateSerializer]
public class WalletState
{
    [Id(0)] public Guid UserId { get; set; }
    [Id(1)] public string TenantId { get; set; } = string.Empty;
    [Id(2)] public string Currency { get; set; } = "USD";
    
    // Balances
    [Id(3)] public decimal Balance { get; set; }
    [Id(4)] public decimal TotalDeposited { get; set; }
    [Id(5)] public decimal TotalWithdrawn { get; set; }
    [Id(6)] public decimal TotalWon { get; set; }
    [Id(7)] public decimal TotalLost { get; set; }
    
    // Status
    [Id(8)] public WalletStatus Status { get; set; } = WalletStatus.Active;
    [Id(9)] public DateTimeOffset LastUpdated { get; set; }
    [Id(10)] public DateTimeOffset CreatedAt { get; set; }

    /// <summary>Tracks bet debits by slip id for idempotent wallet operations.</summary>
    [Id(11)] public Dictionary<Guid, decimal> BetDebitsBySlipId { get; } = new();

    /// <summary>Tracks bet credits by slip id for idempotent settlement.</summary>
    [Id(12)] public Dictionary<Guid, decimal> BetCreditsBySlipId { get; } = new();
}