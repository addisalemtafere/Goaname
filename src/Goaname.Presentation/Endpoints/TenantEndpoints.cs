using Goaname.Application.Features.Tenants.GetTenant;
using Goaname.Application.Features.Tenants.InitializeTenant;
using Goaname.Application.Features.Tenants.UpdateTenantBetting;
using Goaname.Contracts.Tenants;
using MediatR;

namespace Goaname.Presentation.Endpoints;

internal static class TenantEndpoints
{
    public static IEndpointRouteBuilder MapTenantEndpoints(this IEndpointRouteBuilder app)
    {
        ArgumentNullException.ThrowIfNull(app);

        var group = app.MapGroup("/api/tenants").WithTags("Tenants");

        group.MapGet("/{tenantId}", GetTenantAsync);
        group.MapPost("/{tenantId}/initialize", InitializeTenantAsync);
        group.MapPost("/{tenantId}/betting", UpdateTenantBettingAsync);

        return app;
    }

    private static async Task<IResult> GetTenantAsync(ISender sender, string tenantId)
    {
        var tenant = await sender.Send(new GetTenantQuery(tenantId)).ConfigureAwait(false);
        return Results.Ok(tenant);
    }

    private static async Task<IResult> InitializeTenantAsync(
        ISender sender,
        string tenantId,
        InitializeTenantRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        var tenant = await sender.Send(
            new InitializeTenantCommand(tenantId, request.Name, request.Currency)).ConfigureAwait(false);

        return Results.Created($"/api/tenants/{tenantId}", tenant);
    }

    private static async Task<IResult> UpdateTenantBettingAsync(
        ISender sender,
        string tenantId,
        UpdateTenantBettingRequest request)
    {
        await sender.Send(new UpdateTenantBettingCommand(tenantId, request.Enabled)).ConfigureAwait(false);
        return Results.NoContent();
    }
}
