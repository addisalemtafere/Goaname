namespace Goaname.Presentation.Extensions;

using Goaname.Presentation.Configuration;
using Orleans.Dashboard;
using Orleans.Hosting;
using Orleans.Transactions;

internal static class OrleansHostExtensions
{
    public const string GrainStorageName = "GoanameStore";

    public static WebApplicationBuilder AddGoanameOrleans(this WebApplicationBuilder builder)
    {
        ArgumentNullException.ThrowIfNull(builder);

        builder.Services
            .AddOptions<OrleansOptions>()
            .Bind(builder.Configuration.GetSection(OrleansOptions.SectionName));

        builder.Host.UseOrleans((context, siloBuilder) =>
        {
            var options = context.Configuration
                .GetSection(OrleansOptions.SectionName)
                .Get<OrleansOptions>() ?? new OrleansOptions();

            ConfigureClustering(siloBuilder, options);
            ConfigureReminders(siloBuilder, options);
            ConfigureGrainStorage(siloBuilder, options, context.HostingEnvironment);
            ConfigureTransactions(siloBuilder, options);
            ConfigureDashboard(siloBuilder, options);
        });

        return builder;
    }

    private static void ConfigureClustering(ISiloBuilder siloBuilder, OrleansOptions options)
    {
        var provider = options.Clustering.Provider;

        if (string.Equals(provider, "Redis", StringComparison.OrdinalIgnoreCase))
        {
            siloBuilder.UseRedisClustering(options.Clustering.RedisConnectionString);
            return;
        }

        if (string.Equals(provider, "Localhost", StringComparison.OrdinalIgnoreCase))
        {
            siloBuilder.UseLocalhostClustering();
            return;
        }

        throw new InvalidOperationException($"Unsupported Orleans clustering provider '{provider}'.");
    }

    private static void ConfigureReminders(ISiloBuilder siloBuilder, OrleansOptions options)
    {
        if (string.Equals(options.Reminders.Provider, "AdoNet", StringComparison.OrdinalIgnoreCase))
        {
            siloBuilder.UseAdoNetReminderService(adoOptions =>
            {
                adoOptions.Invariant = options.Reminders.Invariant;
                adoOptions.ConnectionString = options.Reminders.ConnectionString;
            });
            return;
        }

        siloBuilder.UseInMemoryReminderService();
    }

    private static void ConfigureGrainStorage(
        ISiloBuilder siloBuilder,
        OrleansOptions options,
        IHostEnvironment environment)
    {
        if (string.Equals(options.Storage.Provider, "AdoNet", StringComparison.OrdinalIgnoreCase))
        {
            siloBuilder.AddAdoNetGrainStorage(GrainStorageName, adoOptions =>
            {
                adoOptions.Invariant = options.Storage.Invariant;
                adoOptions.ConnectionString = options.Storage.ConnectionString;
            });
            return;
        }

        if (!environment.IsDevelopment())
        {
            throw new InvalidOperationException(
                "Production requires Orleans:Storage:Provider=AdoNet with a PostgreSQL connection string.");
        }

        siloBuilder.AddMemoryGrainStorage(GrainStorageName);
    }

    private static void ConfigureTransactions(ISiloBuilder siloBuilder, OrleansOptions options)
    {
        if (!options.Transactions.Enabled)
        {
            return;
        }

        siloBuilder.UseTransactions();
    }

    private static void ConfigureDashboard(ISiloBuilder siloBuilder, OrleansOptions options)
    {
        if (!options.Dashboard.Enabled)
        {
            return;
        }

        siloBuilder.AddDashboard(dashboardOptions =>
        {
            dashboardOptions.CounterUpdateIntervalMs = options.Dashboard.CounterUpdateIntervalMs;
        });
    }
}
