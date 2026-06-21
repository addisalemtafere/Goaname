namespace Goaname.Presentation;

internal static class Program
{
    public static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        var app = builder.Build();

        app.MapGet("/", () => "Goaname API is running");

        await app.RunAsync().ConfigureAwait(false);
    }
}