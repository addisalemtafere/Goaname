using Goaname.Application.Common;

namespace Goaname.Application.Features.Tenants.UpdateTenantBetting;

public sealed record UpdateTenantBettingCommand(string TenantId, bool Enabled) : ICommand;
