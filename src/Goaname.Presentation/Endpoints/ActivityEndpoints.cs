using Goaname.Application.Features.Activity.ListActivity;
using MediatR;

namespace Goaname.Presentation.Endpoints;

internal static class ActivityEndpoints
{
    public static IEndpointRouteBuilder MapActivityEndpoints(this IEndpointRouteBuilder app)
    {
        ArgumentNullException.ThrowIfNull(app);

        app.MapGet("/api/tenants/{tenantId}/activity", ListActivityAsync)
            .WithTags("Activity");

        return app;
    }

    private static Task<IResult> ListActivityAsync(ISender sender, string tenantId, int? limit) =>
        SendOkAsync(sender, new ListActivityQuery(NormalizeTenantId(tenantId), limit ?? 50), Results.Ok);

    private static async Task<IResult> SendOkAsync<TResponse>(
        ISender sender,
        IRequest<TResponse> request,
        Func<TResponse, IResult> ok)
    {
        var response = await sender.Send(request).ConfigureAwait(false);
        return ok(response);
    }

    private static string NormalizeTenantId(string tenantId) =>
        tenantId.Trim();
}
