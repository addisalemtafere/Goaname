using Goaname.Application.Common;

namespace Goaname.Application.Features.Tenants.AddTenantCategory;

public sealed record AddTenantCategoryCommand(string TenantId, string Name) : ICommand;
