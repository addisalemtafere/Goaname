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

        builder.Services.AddApplicationServices();
        builder.Services.AddGoanameAuthentication(builder.Configuration, builder.Environment);
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

                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                await Results.Problem("An unexpected error occurred.")
                    .ExecuteAsync(context)
                    .ConfigureAwait(false);
            });
        });

        app.UseAuthentication();
        app.UseAuthorization();

        app.MapGet("/", () => "Goaname API is running");
        app.MapTenantEndpoints();
        app.MapGoanameOrleansDashboard();

        await app.RunAsync().ConfigureAwait(false);
    }
}
