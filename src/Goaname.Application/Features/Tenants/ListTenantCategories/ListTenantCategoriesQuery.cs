using Goaname.Application.Common;

namespace Goaname.Application.Features.Tenants.ListTenantCategories;

public sealed record ListTenantCategoriesQuery(string TenantId) : IQuery<IReadOnlyList<string>>;
