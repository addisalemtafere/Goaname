using Goaname.Application.Common.Abstractions;
using Goaname.Infrastructure.Persistence.Data;
using Goaname.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Goaname.Infrastructure;

public static class InfrastructureServiceRegistration
{
    public const string PostgresConnectionName = "Postgres";

    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(services);
        ArgumentNullException.ThrowIfNull(configuration);

        var connectionString = configuration.GetConnectionString(PostgresConnectionName)
            ?? throw new InvalidOperationException($"ConnectionStrings:{PostgresConnectionName} is required.");

        services.AddDbContext<GoanameDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddScoped<IBetHistoryRepository, BetHistoryRepository>();

        return services;
    }

    public static async Task MigrateDatabaseAsync(this IServiceProvider services)
    {
        ArgumentNullException.ThrowIfNull(services);

        using var scope = services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<GoanameDbContext>();
        await dbContext.Database.MigrateAsync().ConfigureAwait(false);
    }
}
