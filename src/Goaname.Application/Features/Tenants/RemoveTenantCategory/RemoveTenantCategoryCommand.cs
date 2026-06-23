using Goaname.Application.Common;

namespace Goaname.Application.Features.Tenants.RemoveTenantCategory;

public sealed record RemoveTenantCategoryCommand(string TenantId, string Name) : ICommand;
