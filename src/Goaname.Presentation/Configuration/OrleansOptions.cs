namespace Goaname.Presentation.Configuration;

internal sealed class OrleansOptions
{
    public const string SectionName = "Goaname:Orleans";

    public TransactionsOptions Transactions { get; init; } = new();

    public DashboardOptions Dashboard { get; init; } = new();
}

internal sealed class TransactionsOptions
{
    public bool Enabled { get; init; } = true;
}

internal sealed class DashboardOptions
{
    public bool Enabled { get; init; }

    public string RoutePrefix { get; init; } = "/orleans";

    public int CounterUpdateIntervalMs { get; init; } = 1000;

    public bool RequireAuthorization { get; init; } = true;
}
