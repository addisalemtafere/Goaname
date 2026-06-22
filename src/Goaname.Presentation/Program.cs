using Goaname.Application;
using Goaname.Domain.Exceptions;
using Goaname.Presentation.Endpoints;
using Goaname.Presentation.Extensions;

namespace Goaname.Presentation;

internal static class Program
{
    public static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.AddGoanameConfiguration();
        builder.Services.AddApplicationServices();
        builder.Services.AddGoanameAuth();
        builder.Services.AddGoanameAuthentication(builder.Configuration, builder.Environment);
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("Frontend", policy =>
                policy.WithOrigins("http://localhost:5173")
                    .AllowAnyHeader()
                    .AllowAnyMethod());
        });
        builder.AddGoanameOrleans();

        var app = builder.Build();

        app.UseExceptionHandler(exceptionHandlerApp =>
        {
            exceptionHandlerApp.Run(async context =>
            {
                var exception = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>()?.Error;
                if (exception is ValidationException validationException)
                {
                    context.Response.StatusCode = StatusCodes.Status400BadRequest;
                    await Results.ValidationProblem(validationException.Errors)
                        .ExecuteAsync(context)
                        .ConfigureAwait(false);
                    return;
                }

                if (exception is BusinessRuleException businessRuleException)
                {
                    context.Response.StatusCode = StatusCodes.Status409Conflict;
                    await Results.Problem(businessRuleException.Message, statusCode: StatusCodes.Status409Conflict)
                        .ExecuteAsync(context)
                        .ConfigureAwait(false);
                    return;
                }

                if (exception is UnauthorizedAccessException unauthorizedException)
                {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    await Results.Problem(unauthorizedException.Message, statusCode: StatusCodes.Status401Unauthorized)
                        .ExecuteAsync(context)
                        .ConfigureAwait(false);
                    return;
                }

                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                await Results.Problem("An unexpected error occurred.")
                    .ExecuteAsync(context)
                    .ConfigureAwait(false);
            });
        });

        app.UseCors("Frontend");
        app.UseAuthentication();
        app.UseAuthorization();

        app.MapGet("/", () => "Goaname API is running");
        app.MapTenantEndpoints();
        app.MapUserEndpoints();
        app.MapAuthEndpoints();
        app.MapGoanameOrleansDashboard();

        await app.RunAsync().ConfigureAwait(false);
    }
}
