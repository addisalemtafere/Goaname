using Goaname.Application.Auth;
using Goaname.Application.Common;
using Goaname.Contracts.Admin;
using Goaname.Grains.Interfaces;
using MediatR;

namespace Goaname.Application.Features.Tenants.ListTenants;

public sealed record ListTenantsQuery : IQuery<IReadOnlyList<TenantSummaryDto>>;

public sealed class ListTenantsQueryHandler(
    IGrainFactory grainFactory,
    IRoleRegistryProvider roleRegistryProvider)
    : IRequestHandler<ListTenantsQuery, IReadOnlyList<TenantSummaryDto>>
{
    public async Task<IReadOnlyList<TenantSummaryDto>> Handle(ListTenantsQuery request, CancellationToken cancellationToken)
    {
        var catalog = grainFactory.GetGrain<ITenantCatalogGrain>(GrainKeys.PlatformTenantCatalog);
        var tenantIds = new HashSet<string>(
            await catalog.GetTenantIdsAsync().ConfigureAwait(false),
            StringComparer.OrdinalIgnoreCase);

        foreach (var tenantId in roleRegistryProvider.GetCurrent().TenantAdmins.Keys)
        {
            tenantIds.Add(tenantId);
        }

        var summaries = new List<TenantSummaryDto>();

        foreach (var tenantId in tenantIds.OrderBy(static id => id, StringComparer.OrdinalIgnoreCase))
        {
            var summary = await TryMapSummaryAsync(tenantId).ConfigureAwait(false);
            if (summary is not null)
            {
                summaries.Add(summary);
            }
        }

        return summaries;
    }

    private async Task<TenantSummaryDto?> TryMapSummaryAsync(string tenantId)
    {
        var tenantGrain = grainFactory.GetGrain<ITenantGrain>(GrainKeys.Tenant(tenantId));
        var state = await tenantGrain.GetStateAsync().ConfigureAwait(false);

        if (string.IsNullOrWhiteSpace(state.TenantId))
        {
            return null;
        }

        return new TenantSummaryDto
        {
            TenantId = state.TenantId,
            Name = state.Name,
            OperationalStatus = state.OperationalStatus,
            BettingEnabled = state.BettingEnabled,
            Currency = state.Currency,
            LastUpdatedAt = state.LastUpdatedAt,
        };
    }
}
