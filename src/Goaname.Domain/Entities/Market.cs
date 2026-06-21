namespace Goaname.Domain.Entities;

public class Market
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public Uri? ImageUrl { get; set; }
    public string MarketType { get; set; } = "binary"; // binary, updown, etc.
    public string Source { get; set; } = "parimutuel";
    
    public string Status { get; set; } = "draft"; // draft, open, closing, resolved, settled
    
    public DateTimeOffset TradingEndsAt { get; set; }
    public DateTimeOffset ResolutionAt { get; set; }
    
    public bool IsPinned { get; set; }
    public int DisplayOrder { get; set; }
    public DateTimeOffset? PinnedAt { get; set; }
    
    // Stored as decimal for precise financial calculations, UI can format as "$175"
    public decimal Volume { get; set; } 
    public int Traders { get; set; }
    
    public Uri? OracleUrl { get; set; }
    
    // Relationships
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    
    public ICollection<MarketOutcome> Outcomes { get; } = new List<MarketOutcome>();
}