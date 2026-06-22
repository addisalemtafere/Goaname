namespace Goaname.Presentation.Extensions;

using Goaname.Presentation.Configuration;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Text;

internal static class AuthenticationExtensions
{
    public static IServiceCollection AddGoanameAuthentication(
        this IServiceCollection services,
        IConfiguration configuration,
        IHostEnvironment environment)
    {
        ArgumentNullException.ThrowIfNull(services);
        ArgumentNullException.ThrowIfNull(configuration);
        ArgumentNullException.ThrowIfNull(environment);

        var jwtSection = configuration.GetSection("Authentication:JwtBearer");

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = jwtSection.GetValue("RequireHttpsMetadata", !environment.IsDevelopment());

                if (jwtSection.GetValue("UseDevelopmentKey", false) && environment.IsDevelopment())
                {
                    var signingKey = jwtSection["SigningKey"]
                        ?? throw new InvalidOperationException("Authentication:JwtBearer:SigningKey is required for development JWT.");

                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = jwtSection["Issuer"] ?? "goaname-dev",
                        ValidAudience = jwtSection["Audience"] ?? "goaname",
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey)),
                    };
                }
                else
                {
                    options.Authority = jwtSection["Authority"];
                    options.Audience = jwtSection["Audience"];
                }
            });

        services.AddAuthorizationBuilder()
            .AddPolicy(GoanamePolicies.OrleansDashboard, policy =>
                policy.RequireAuthenticatedUser()
                    .RequireRole("Admin"));

        return services;
    }
}
