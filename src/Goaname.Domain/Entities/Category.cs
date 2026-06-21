namespace Goaname.Domain.Entities;

public class Category
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Uri? IconUrl { get; set; }
    
    public ICollection<Market> Markets { get; } = new List<Market>();
}