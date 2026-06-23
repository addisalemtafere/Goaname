using Goaname.Application.Features.Leaderboard.GetLeaderboard;
using MediatR;

namespace Goaname.Presentation.Endpoints;

internal static class LeaderboardEndpoints
{
    public static IEndpointRouteBuilder MapLeaderboardEndpoints(this IEndpointRouteBuilder app)
    {
        ArgumentNullException.ThrowIfNull(app);

        app.MapGet("/api/tenants/{tenantId}/leaderboard", GetLeaderboardAsync)
            .WithTags("Leaderboard");

        return app;
    }

    private static Task<IResult> GetLeaderboardAsync(ISender sender, string tenantId, int? limit) =>
        SendOkAsync(
            sender,
            new GetLeaderboardQuery(NormalizeTenantId(tenantId), limit ?? 25),
            Results.Ok);

    private static async Task<IResult> SendOkAsync<TResponse>(
        ISender sender,
        IRequest<TResponse> request,
        Func<TResponse, IResult> ok)
    {
        var response = await sender.Send(request).ConfigureAwait(false);
        return ok(response);
    }

    private static string NormalizeTenantId(string tenantId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(tenantId);
        return tenantId.Trim();
    }
}
