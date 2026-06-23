namespace Goaname.Presentation.Configuration;

internal sealed class JwtOptions
{
    public const string SectionName = "Authentication:JwtBearer";

    public bool UseDevelopmentKey { get; init; }
    public bool AllowLocalAccounts { get; init; }
    public string Issuer { get; init; } = "goaname-dev";
    public string Audience { get; init; } = "goaname";
    public string SigningKey { get; init; } = string.Empty;
    public int TokenLifetimeHours { get; init; } = 8;
}

internal static class JwtConfiguration
{
    public static JwtOptions GetOptions(IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);

        return configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();
    }

    public static bool IsLocalAuthEnabled(IConfiguration configuration)
    {
        var options = GetOptions(configuration);
        return options.AllowLocalAccounts && !string.IsNullOrWhiteSpace(options.SigningKey);
    }
}
