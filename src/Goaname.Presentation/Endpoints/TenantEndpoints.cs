using Goaname.Application.Features.Tenants.AddTenantCategory;
using Goaname.Application.Features.Tenants.GetTenant;
using Goaname.Application.Features.Tenants.InitializeTenant;
using Goaname.Application.Features.Tenants.ListTenantCategories;
using Goaname.Application.Features.Tenants.RemoveTenantCategory;
using Goaname.Application.Features.Tenants.UpdateTenantBetting;
using Goaname.Contracts.Tenants;
using Goaname.Presentation.Configuration;
using Goaname.Presentation.Extensions;
using MediatR;

namespace Goaname.Presentation.Endpoints;

internal static class TenantEndpoints
{
    public static IEndpointRouteBuilder MapTenantEndpoints(this IEndpointRouteBuilder app)
    {
        ArgumentNullException.ThrowIfNull(app);

        var group = app.MapGroup("/api/tenants").WithTags("Tenants");

        group.MapGet("/{tenantId}", GetTenantAsync);
        group.MapGet("/{tenantId}/categories", ListTenantCategoriesAsync);

        group.MapPost("/{tenantId}/initialize", InitializeTenantAsync)
            .RequireAuthorization(GoanamePolicies.SuperAdmin);
        group.MapPost("/{tenantId}/betting", UpdateTenantBettingAsync)
            .RequireAuthorization(GoanamePolicies.SuperAdmin);

        var admin = group.MapGroup("/{tenantId}/admin")
            .RequireAuthorization(GoanamePolicies.TenantAdmin);

        admin.MapGet("/categories", ListTenantCategoriesAsync);
        admin.MapPost("/categories", AddTenantCategoryAsync);
        admin.MapDelete("/categories/{categoryName}", RemoveTenantCategoryAsync);

        return app;
    }

    private static Task<IResult> GetTenantAsync(ISender sender, string tenantId) =>
        SendOkAsync(sender, new GetTenantQuery(NormalizeTenantId(tenantId)), Results.Ok);

    private static async Task<IResult> InitializeTenantAsync(
        HttpContext httpContext,
        ISender sender,
        string tenantId,
        InitializeTenantRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        var tenant = await sender.Send(
            new InitializeTenantCommand(httpContext.GetTenantId(tenantId), request.Name, request.Currency))
            .ConfigureAwait(false);

        return Results.Created($"/api/tenants/{tenant.TenantId}", tenant);
    }

    private static async Task<IResult> UpdateTenantBettingAsync(
        HttpContext httpContext,
        ISender sender,
        string tenantId,
        UpdateTenantBettingRequest request)
    {
        await sender
            .Send(new UpdateTenantBettingCommand(httpContext.GetTenantId(tenantId), request.Enabled))
            .ConfigureAwait(false);

        return Results.NoContent();
    }

    private static Task<IResult> ListTenantCategoriesAsync(ISender sender, string tenantId) =>
        SendOkAsync(sender, new ListTenantCategoriesQuery(NormalizeTenantId(tenantId)), Results.Ok);

    private static async Task<IResult> AddTenantCategoryAsync(
        HttpContext httpContext,
        ISender sender,
        string tenantId,
        AddTenantCategoryRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        await sender
            .Send(new AddTenantCategoryCommand(httpContext.GetTenantId(tenantId), request.Name))
            .ConfigureAwait(false);

        return Results.NoContent();
    }

    private static async Task<IResult> RemoveTenantCategoryAsync(
        HttpContext httpContext,
        ISender sender,
        string tenantId,
        string categoryName)
    {
        await sender
            .Send(new RemoveTenantCategoryCommand(httpContext.GetTenantId(tenantId), categoryName))
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

    private static string NormalizeTenantId(string tenantId) =>
        tenantId.Trim();
}
