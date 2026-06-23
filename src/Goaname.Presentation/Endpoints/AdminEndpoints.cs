using Goaname.Application.Features.Auth.Permissions;
using Goaname.Application.Features.Admin.RoleRegistry.GetRoleRegistry;
using Goaname.Application.Features.Admin.RoleRegistry.GrantSuperAdmin;
using Goaname.Application.Features.Admin.RoleRegistry.GrantTenantAdmin;
using Goaname.Application.Features.Admin.RoleRegistry.RevokeSuperAdmin;
using Goaname.Application.Features.Admin.RoleRegistry.RevokeTenantAdmin;
using Goaname.Application.Features.Admin.RoleRegistry.UpdateRoleRegistry;
using Goaname.Application.Features.Tenants.ListTenants;
using Goaname.Application.Features.Tenants.UpdateTenantSettings;
using Goaname.Application.Features.Users.Admin.AdjustUserWallet;
using Goaname.Application.Features.Users.Admin.GetTenantUser;
using Goaname.Application.Features.Users.Admin.ListTenantUsers;
using Goaname.Application.Features.Users.Admin.SetUserKycStatus;
using Goaname.Contracts.Admin;
using Goaname.Presentation.Admin;
using Goaname.Presentation.Configuration;
using Goaname.Presentation.Extensions;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Goaname.Presentation.Endpoints;

internal static class AdminEndpoints
{
    public static IEndpointRouteBuilder MapAdminEndpoints(this IEndpointRouteBuilder app)
    {
        ArgumentNullException.ThrowIfNull(app);

        var platform = app.MapGroup("/api/admin")
            .RequireAuthorization(GoanamePolicies.SuperAdmin)
            .WithTags("Admin");

        platform.MapGet("/tenants", ListTenantsAsync);
        platform.MapGet("/clients", ListClientsAsync);
        platform.MapPost("/clients", CreateClientAsync);
        platform.MapPut("/clients/{clientId}", UpdateClientAsync);
        platform.MapDelete("/clients/{clientId}", DeleteClientAsync);
        platform.MapGet("/app-settings", GetAppSettingsAsync);
        platform.MapGet("/permissions", GetPermissionMatrixAsync);
        platform.MapGet("/roles", GetRoleRegistryAsync);
        platform.MapPut("/roles", UpdateRoleRegistryAsync);
        platform.MapPost("/roles/super-admins", GrantSuperAdminAsync);
        platform.MapDelete("/roles/super-admins/{email}", RevokeSuperAdminAsync);
        platform.MapPost("/roles/tenant-admins", GrantTenantAdminAsync);
        platform.MapDelete("/roles/tenant-admins", RevokeTenantAdminAsync);

        var tenantAdmin = app.MapGroup("/api/tenants/{tenantId}/admin")
            .RequireAuthorization(GoanamePolicies.TenantAdmin)
            .WithTags("Admin");

        tenantAdmin.MapGet("/overview", GetOverviewAsync);
        tenantAdmin.MapGet("/permissions", GetPermissionMatrixAsync);
        tenantAdmin.MapPatch("/settings", UpdateTenantSettingsAsync);
        tenantAdmin.MapGet("/users", ListUsersAsync);
        tenantAdmin.MapGet("/users/{userId:guid}", GetUserAsync);
        tenantAdmin.MapPost("/users/{userId:guid}/wallet", AdjustWalletAsync);
        tenantAdmin.MapPatch("/users/{userId:guid}/kyc", SetKycStatusAsync);
        tenantAdmin.MapPost("/roles/tenant-admins/grant", GrantTenantAdminForTenantAsync);
        tenantAdmin.MapPost("/roles/tenant-admins/revoke", RevokeTenantAdminForTenantAsync);

        return app;
    }

    private static async Task<IResult> ListTenantsAsync(ISender sender, CancellationToken cancellationToken)
    {
        var tenants = await sender.Send(new ListTenantsQuery(), cancellationToken).ConfigureAwait(false);
        return Results.Ok(tenants);
    }

    private static async Task<IResult> GetOverviewAsync(
        HttpContext httpContext,
        ISender sender,
        OpenIddictClientAdminService clientAdmin,
        string tenantId,
        CancellationToken cancellationToken)
    {
        var scopedTenantId = httpContext.GetTenantId(tenantId);
        var users = await sender.Send(new ListTenantUsersQuery(scopedTenantId), cancellationToken).ConfigureAwait(false);
        var isSuperAdmin = httpContext.User.IsSuperAdmin();

        var tenantCount = 1;
        var clientCount = 0;

        if (isSuperAdmin)
        {
            var tenants = await sender.Send(new ListTenantsQuery(), cancellationToken).ConfigureAwait(false);
            tenantCount = tenants.Count;
            clientCount = await clientAdmin.CountAsync(cancellationToken).ConfigureAwait(false);
        }

        return Results.Ok(new BackOfficeOverviewDto
        {
            TenantCount = tenantCount,
            UserCount = users.Count,
            OAuthClientCount = clientCount,
            ActiveTenantId = scopedTenantId,
        });
    }

    private static async Task<IResult> UpdateTenantSettingsAsync(
        HttpContext httpContext,
        ISender sender,
        string tenantId,
        [FromBody] UpdateTenantSettingsRequest request,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var tenant = await sender.Send(
            new UpdateTenantSettingsCommand(httpContext.GetTenantId(tenantId), request),
            cancellationToken).ConfigureAwait(false);

        return Results.Ok(tenant);
    }

    private static async Task<IResult> ListUsersAsync(
        HttpContext httpContext,
        ISender sender,
        string tenantId,
        CancellationToken cancellationToken)
    {
        var users = await sender.Send(new ListTenantUsersQuery(httpContext.GetTenantId(tenantId)), cancellationToken).ConfigureAwait(false);
        return Results.Ok(users);
    }

    private static async Task<IResult> GetUserAsync(
        HttpContext httpContext,
        ISender sender,
        string tenantId,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var user = await sender.Send(new GetTenantUserQuery(httpContext.GetTenantId(tenantId), userId), cancellationToken).ConfigureAwait(false);
        return Results.Ok(user);
    }

    private static async Task<IResult> AdjustWalletAsync(
        HttpContext httpContext,
        ISender sender,
        string tenantId,
        Guid userId,
        [FromBody] AdjustUserWalletRequest request,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var wallet = await sender.Send(
            new AdjustUserWalletCommand(httpContext.GetTenantId(tenantId), userId, request.Amount),
            cancellationToken).ConfigureAwait(false);

        return Results.Ok(wallet);
    }

    private static async Task<IResult> SetKycStatusAsync(
        HttpContext httpContext,
        ISender sender,
        string tenantId,
        Guid userId,
        [FromBody] SetUserKycStatusRequest request,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var user = await sender.Send(
            new SetUserKycStatusCommand(httpContext.GetTenantId(tenantId), userId, request.Status),
            cancellationToken).ConfigureAwait(false);

        return Results.Ok(user);
    }

    private static async Task<IResult> ListClientsAsync(
        OpenIddictClientAdminService clientAdmin,
        CancellationToken cancellationToken)
    {
        var clients = await clientAdmin.ListAsync(cancellationToken).ConfigureAwait(false);
        return Results.Ok(clients);
    }

    private static async Task<IResult> CreateClientAsync(
        OpenIddictClientAdminService clientAdmin,
        [FromBody] CreateOAuthClientRequest request,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var client = await clientAdmin.CreateAsync(request, cancellationToken).ConfigureAwait(false);
        return Results.Created($"/api/admin/clients/{client.ClientId}", client);
    }

    private static async Task<IResult> UpdateClientAsync(
        OpenIddictClientAdminService clientAdmin,
        string clientId,
        [FromBody] UpdateOAuthClientRequest request,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var client = await clientAdmin.UpdateAsync(clientId, request, cancellationToken).ConfigureAwait(false);
        return Results.Ok(client);
    }

    private static async Task<IResult> DeleteClientAsync(
        OpenIddictClientAdminService clientAdmin,
        string clientId,
        CancellationToken cancellationToken)
    {
        await clientAdmin.DeleteAsync(clientId, cancellationToken).ConfigureAwait(false);
        return Results.NoContent();
    }

    private static IResult GetAppSettingsAsync(AppSettingsReader appSettingsReader) =>
        Results.Ok(appSettingsReader.Read());

    private static IResult GetPermissionMatrixAsync() =>
        Results.Ok(PermissionMappings.BuildMatrix());

    private static async Task<IResult> GetRoleRegistryAsync(ISender sender, CancellationToken cancellationToken)
    {
        var registry = await sender.Send(new GetRoleRegistryQuery(), cancellationToken).ConfigureAwait(false);
        return Results.Ok(registry);
    }

    private static async Task<IResult> UpdateRoleRegistryAsync(
        ISender sender,
        [FromBody] UpdateRoleRegistryRequest request,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var registry = await sender.Send(new UpdateRoleRegistryCommand(request), cancellationToken).ConfigureAwait(false);
        return Results.Ok(registry);
    }

    private static async Task<IResult> GrantSuperAdminAsync(
        ISender sender,
        [FromBody] SuperAdminRoleRequest request,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var registry = await sender.Send(new GrantSuperAdminCommand(request.Email), cancellationToken).ConfigureAwait(false);
        return Results.Ok(registry);
    }

    private static async Task<IResult> RevokeSuperAdminAsync(
        ISender sender,
        string email,
        CancellationToken cancellationToken)
    {
        var registry = await sender.Send(new RevokeSuperAdminCommand(email), cancellationToken).ConfigureAwait(false);
        return Results.Ok(registry);
    }

    private static async Task<IResult> GrantTenantAdminAsync(
        ISender sender,
        [FromBody] TenantAdminRoleRequest request,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var registry = await sender.Send(new GrantTenantAdminCommand(request.TenantId, request.Email), cancellationToken).ConfigureAwait(false);
        return Results.Ok(registry);
    }

    private static async Task<IResult> RevokeTenantAdminAsync(
        ISender sender,
        [FromBody] TenantAdminRoleRequest request,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var registry = await sender.Send(new RevokeTenantAdminCommand(request.TenantId, request.Email), cancellationToken).ConfigureAwait(false);
        return Results.Ok(registry);
    }

    private static async Task<IResult> GrantTenantAdminForTenantAsync(
        HttpContext httpContext,
        ISender sender,
        string tenantId,
        [FromBody] EmailRoleRequest request,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var scopedTenantId = httpContext.GetTenantId(tenantId);
        var registry = await sender.Send(new GrantTenantAdminCommand(scopedTenantId, request.Email), cancellationToken).ConfigureAwait(false);
        return Results.Ok(registry);
    }

    private static async Task<IResult> RevokeTenantAdminForTenantAsync(
        HttpContext httpContext,
        ISender sender,
        string tenantId,
        [FromBody] EmailRoleRequest request,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var scopedTenantId = httpContext.GetTenantId(tenantId);
        var registry = await sender.Send(new RevokeTenantAdminCommand(scopedTenantId, request.Email), cancellationToken).ConfigureAwait(false);
        return Results.Ok(registry);
    }
}
