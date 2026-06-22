namespace Goaname.Presentation.Configuration;

internal sealed class OrleansOptions
{
    public const string SectionName = "Orleans";

    public ClusteringOptions Clustering { get; init; } = new();

    public StorageOptions Storage { get; init; } = new();

    public RemindersOptions Reminders { get; init; } = new();

    public TransactionsOptions Transactions { get; init; } = new();

    public DashboardOptions Dashboard { get; init; } = new();
}

internal sealed class ClusteringOptions
{
    public string Provider { get; init; } = "Localhost";

    public string RedisConnectionString { get; init; } = "localhost:6379";
}

internal sealed class StorageOptions
{
    public string Provider { get; init; } = "Memory";

    public string ConnectionString { get; init; } = string.Empty;

    public string Invariant { get; init; } = "Npgsql";
}

internal sealed class RemindersOptions
{
    public string Provider { get; init; } = "Memory";

    public string ConnectionString { get; init; } = string.Empty;

    public string Invariant { get; init; } = "Npgsql";
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

    public bool RequireAuthorization { get; init; }
}
