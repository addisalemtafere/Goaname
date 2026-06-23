using Goaname.Application.Features.Tenants.AddTenantCategory;
using Goaname.Application.Features.Tenants.GetTenant;
using Goaname.Application.Features.Tenants.InitializeTenant;
using Goaname.Application.Features.Tenants.ListTenantCategories;
using Goaname.Application.Features.Tenants.RemoveTenantCategory;
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
        group.MapGet("/{tenantId}/categories", ListTenantCategoriesAsync);
        group.MapGet("/{tenantId}/admin/categories", ListTenantCategoriesAsync);
        group.MapPost("/{tenantId}/admin/categories", AddTenantCategoryAsync);
        group.MapDelete("/{tenantId}/admin/categories/{categoryName}", RemoveTenantCategoryAsync);

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

    private static Task<IResult> ListTenantCategoriesAsync(ISender sender, string tenantId) =>
        SendOkAsync(sender, new ListTenantCategoriesQuery(tenantId), Results.Ok);

    private static async Task<IResult> AddTenantCategoryAsync(
        ISender sender,
        string tenantId,
        AddTenantCategoryRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        await sender
            .Send(new AddTenantCategoryCommand(tenantId, request.Name))
            .ConfigureAwait(false);

        return Results.NoContent();
    }

    private static async Task<IResult> RemoveTenantCategoryAsync(
        ISender sender,
        string tenantId,
        string categoryName)
    {
        await sender
            .Send(new RemoveTenantCategoryCommand(tenantId, categoryName))
            .ConfigureAwait(false);

        return Results.NoContent();
    }

    private static async Task<IResult> SendOkAsync<TResponse>(
        ISender sender,
        IRequest<TResponse> request,
        Func<TResponse, IResult> ok)
    {
        var response = await sender.Send(request).ConfigureAwait(false);
        return ok(response);
    }
}
