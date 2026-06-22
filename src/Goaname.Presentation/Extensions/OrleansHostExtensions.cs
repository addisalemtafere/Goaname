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

            ConfigureTransactions(siloBuilder, options);
            ConfigureDashboard(siloBuilder, options);
        });

        return builder;
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
