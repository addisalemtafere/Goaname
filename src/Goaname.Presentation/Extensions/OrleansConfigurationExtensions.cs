namespace Goaname.Presentation.Extensions;

internal static class OrleansConfigurationExtensions
{
    public const string PostgresConnectionName = "Postgres";
    public const string RedisConnectionName = "Redis";

    public static WebApplicationBuilder AddGoanameConfiguration(this WebApplicationBuilder builder)
    {
        ArgumentNullException.ThrowIfNull(builder);

        ApplyConnectionStringBindings(builder);

        if (!builder.Environment.IsDevelopment())
        {
            ValidateProductionConfiguration(builder.Configuration);
        }

        return builder;
    }

    private static void ApplyConnectionStringBindings(WebApplicationBuilder builder)
    {
        var overrides = new Dictionary<string, string?>();

        var postgres = builder.Configuration.GetConnectionString(PostgresConnectionName);
        if (!string.IsNullOrWhiteSpace(postgres))
        {
            overrides["Orleans:Reminders:ConnectionString"] = postgres;
            overrides[$"Orleans:GrainStorage:{OrleansHostExtensions.GrainStorageName}:ConnectionString"] = postgres;
        }

        var redis = builder.Configuration.GetConnectionString(RedisConnectionName);
        if (!string.IsNullOrWhiteSpace(redis))
        {
            overrides["Orleans:Clustering:ConnectionString"] = redis;
        }

        if (overrides.Count > 0)
        {
            builder.Configuration.AddInMemoryCollection(overrides);
        }
    }

    private static void ValidateProductionConfiguration(ConfigurationManager configuration)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(configuration.GetConnectionString(PostgresConnectionName)))
        {
            errors.Add($"ConnectionStrings:{PostgresConnectionName} is required.");
        }

        if (string.IsNullOrWhiteSpace(configuration.GetConnectionString(RedisConnectionName)))
        {
            errors.Add($"ConnectionStrings:{RedisConnectionName} is required.");
        }

        if (string.IsNullOrWhiteSpace(configuration["Orleans:ClusterId"]))
        {
            errors.Add("Orleans:ClusterId is required.");
        }

        if (string.IsNullOrWhiteSpace(configuration["Orleans:ServiceId"]))
        {
            errors.Add("Orleans:ServiceId is required.");
        }

        var authority = configuration["Authentication:JwtBearer:Authority"];
        if (string.IsNullOrWhiteSpace(authority) ||
            authority.Contains("your-identity-server", StringComparison.OrdinalIgnoreCase))
        {
            errors.Add("Authentication:JwtBearer:Authority must be set to a real identity provider.");
        }

        if (errors.Count > 0)
        {
            throw new InvalidOperationException(
                "Invalid production configuration:\n- " + string.Join("\n- ", errors));
        }
    }
}
