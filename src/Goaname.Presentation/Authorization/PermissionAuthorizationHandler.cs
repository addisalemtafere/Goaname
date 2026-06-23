using Goaname.Application.Auth;
using Goaname.Presentation.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace Goaname.Presentation.Authorization;

internal sealed class PermissionRequirement(string permission) : IAuthorizationRequirement
{
    public string Permission { get; } = permission;
}

internal sealed class PermissionAuthorizationHandler(IPermissionChecker permissionChecker)
    : AuthorizationHandler<PermissionRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        ArgumentNullException.ThrowIfNull(context);
        ArgumentNullException.ThrowIfNull(requirement);

        var email = context.User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
        var tenantId = context.User.FindFirst(HttpContextUserExtensions.TenantIdClaimType)?.Value;

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(tenantId))
        {
            return Task.CompletedTask;
        }

        if (permissionChecker.IsGranted(tenantId, email, requirement.Permission))
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}

internal static class PermissionPolicies
{
    public const string Prefix = "Permission:";

    public static string For(string permission) => Prefix + permission;
}

internal sealed class PermissionAuthorizationPolicyProvider(IOptions<Microsoft.AspNetCore.Authorization.AuthorizationOptions> options)
    : DefaultAuthorizationPolicyProvider(options)
{
    public override Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
    {
        ArgumentNullException.ThrowIfNull(policyName);

        if (policyName.StartsWith(PermissionPolicies.Prefix, StringComparison.Ordinal))
        {
            var permission = policyName[PermissionPolicies.Prefix.Length..];
            var policy = new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .AddRequirements(new PermissionRequirement(permission))
                .Build();

            return Task.FromResult<AuthorizationPolicy?>(policy);
        }

        return base.GetPolicyAsync(policyName);
    }
}
