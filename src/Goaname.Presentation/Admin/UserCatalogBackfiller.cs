using Goaname.Grains.Interfaces;
using Goaname.Infrastructure;
using Npgsql;
using Orleans.Runtime;

namespace Goaname.Presentation.Admin;

internal sealed class UserCatalogBackfiller(
    IGrainFactory grainFactory,
    IConfiguration configuration) : IStartupTask
{
    private const string AuthKeySeparator = "_auth_";

    public async Task Execute(CancellationToken cancellationToken)
    {
        var connectionString = configuration.GetConnectionString(InfrastructureServiceRegistration.PostgresConnectionName);
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            return;
        }

        var connection = new NpgsqlConnection(connectionString);
        try
        {
            await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

            var command = new NpgsqlCommand(
                """
                SELECT grainidextensionstring
                FROM orleansstorage
                WHERE graintypestring = 'credentials'
                ORDER BY grainidextensionstring
                """,
                connection);

            try
            {
                var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);
                try
                {
                    while (await reader.ReadAsync(cancellationToken).ConfigureAwait(false))
                    {
                        var grainKey = reader.GetString(0);
                        if (!TryParseAuthGrainKey(grainKey, out var tenantId, out var email))
                        {
                            continue;
                        }

                        var authGrain = grainFactory.GetGrain<IUserAuthGrain>(GrainKeys.UserAuth(tenantId, email));
                        var credentials = await authGrain.GetStateAsync().ConfigureAwait(false);
                        if (credentials.UserId == Guid.Empty)
                        {
                            continue;
                        }

                        var catalog = grainFactory.GetGrain<IUserCatalogGrain>(GrainKeys.UserCatalog(tenantId));
                        await catalog.RegisterAsync(credentials.UserId).ConfigureAwait(false);
                    }
                }
                finally
                {
                    await reader.DisposeAsync().ConfigureAwait(false);
                }
            }
            finally
            {
                await command.DisposeAsync().ConfigureAwait(false);
            }
        }
        finally
        {
            await connection.DisposeAsync().ConfigureAwait(false);
        }
    }

    private static bool TryParseAuthGrainKey(string grainKey, out string tenantId, out string email)
    {
        tenantId = string.Empty;
        email = string.Empty;

        var separatorIndex = grainKey.IndexOf(AuthKeySeparator, StringComparison.Ordinal);
        if (separatorIndex <= 0)
        {
            return false;
        }

        tenantId = grainKey[..separatorIndex];
        email = grainKey[(separatorIndex + AuthKeySeparator.Length)..];
        return !string.IsNullOrWhiteSpace(tenantId) && !string.IsNullOrWhiteSpace(email);
    }
}
