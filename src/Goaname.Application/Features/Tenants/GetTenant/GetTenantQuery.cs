using Goaname.Application.Common;
using Goaname.Contracts.Tenants;

namespace Goaname.Application.Features.Tenants.GetTenant;

public sealed record GetTenantQuery(string TenantId) : IQuery<TenantDto>;
