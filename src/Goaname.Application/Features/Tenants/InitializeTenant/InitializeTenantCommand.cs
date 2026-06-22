using Goaname.Application.Common;
using Goaname.Contracts.Tenants;

namespace Goaname.Application.Features.Tenants.InitializeTenant;

public sealed record InitializeTenantCommand(string TenantId, string Name, string Currency)
    : ICommand<TenantDto>;
