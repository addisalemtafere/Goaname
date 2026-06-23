namespace Goaname.Presentation.Configuration;

internal sealed class OpenIddictOptions
{
    public const string SectionName = "OpenIddict";

    public int TokenLifetimeHours { get; init; } = 8;
    public string SpaClientId { get; init; } = "goaname-spa";
}

internal static class GoanameAuthOptions
{
    public static OpenIddictOptions GetOpenIddictOptions(IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);
        return configuration.GetSection(OpenIddictOptions.SectionName).Get<OpenIddictOptions>() ?? new OpenIddictOptions();
    }

    public static bool IsLocalAuthEnabled(IConfiguration configuration) =>
        configuration.GetSection("Authentication:JwtBearer").GetValue("AllowLocalAccounts", false);
}
