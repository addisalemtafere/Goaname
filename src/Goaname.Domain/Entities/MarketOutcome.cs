namespace Goaname.Domain.Entities;

public class MarketOutcome
{
    public Guid Id { get; set; }
    public Guid MarketId { get; set; }
    public Market Market { get; set; } = null!;
    
    public string Name { get; set; } = string.Empty; // e.g., "Yes", "No"
    
    // AMM State
    public decimal CurrentProbability { get; set; }
    public decimal CurrentOdds { get; set; }
    public decimal TotalShares { get; set; }
    
    public bool IsWinningOutcome { get; set; }
}