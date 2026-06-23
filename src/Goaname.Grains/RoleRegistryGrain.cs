using Goaname.Domain.Exceptions;
using Goaname.Domain.State;
using Goaname.Grains.Interfaces;
using Orleans.Runtime;

namespace Goaname.Grains;

public class RoleRegistryGrain : Grain, IRoleRegistryGrain
{
    private readonly IPersistentState<RoleRegistryState> _state;

    public RoleRegistryGrain(
        [PersistentState(stateName: "roleregistry", storageName: "GoanameStore")]
        IPersistentState<RoleRegistryState> state)
    {
        _state = state;
    }

    public Task<RoleRegistryState> GetStateAsync() => Task.FromResult(_state.State);

    public async Task EnsureSeededAsync(
        IReadOnlyList<string> superAdminEmails,
        IReadOnlyDictionary<string, IReadOnlyList<string>> tenantAdmins)
    {
        ArgumentNullException.ThrowIfNull(tenantAdmins);

        if (_state.State.Initialized)
        {
            return;
        }

        ApplyReplace(superAdminEmails, tenantAdmins);
        _state.State.Initialized = true;
        await _state.WriteStateAsync().ConfigureAwait(true);
    }

    public async Task ReplaceAsync(
        IReadOnlyList<string> superAdminEmails,
        IReadOnlyDictionary<string, IReadOnlyList<string>> tenantAdmins)
    {
        ArgumentNullException.ThrowIfNull(tenantAdmins);

        ApplyReplace(superAdminEmails, tenantAdmins);
        _state.State.Initialized = true;
        await _state.WriteStateAsync().ConfigureAwait(true);
    }

    public async Task AddSuperAdminAsync(string email)
    {
        var normalized = NormalizeEmail(email);
        if (!ContainsEmail(_state.State.SuperAdminEmails, normalized))
        {
            _state.State.SuperAdminEmails.Add(normalized);
            await _state.WriteStateAsync().ConfigureAwait(true);
        }
    }

    public async Task RemoveSuperAdminAsync(string email)
    {
        var normalized = NormalizeEmail(email);
        var existing = FindEmail(_state.State.SuperAdminEmails, normalized);
        if (existing is not null)
        {
            _state.State.SuperAdminEmails.Remove(existing);
            await _state.WriteStateAsync().ConfigureAwait(true);
        }
    }

    public async Task AddTenantAdminAsync(string tenantId, string email)
    {
        var normalizedTenantId = NormalizeTenantId(tenantId);
        var normalizedEmail = NormalizeEmail(email);
        var assignment = FindAssignment(normalizedTenantId) ?? CreateAssignment(normalizedTenantId);

        if (!ContainsEmail(assignment.Emails, normalizedEmail))
        {
            assignment.Emails.Add(normalizedEmail);
            await _state.WriteStateAsync().ConfigureAwait(true);
        }
    }

    public async Task RemoveTenantAdminAsync(string tenantId, string email)
    {
        var normalizedTenantId = NormalizeTenantId(tenantId);
        var normalizedEmail = NormalizeEmail(email);
        var assignment = FindAssignment(normalizedTenantId);

        if (assignment is null)
        {
            return;
        }

        var existing = FindEmail(assignment.Emails, normalizedEmail);
        if (existing is null)
        {
            return;
        }

        assignment.Emails.Remove(existing);

        if (assignment.Emails.Count == 0)
        {
            _state.State.TenantAdminAssignments.Remove(assignment);
        }

        await _state.WriteStateAsync().ConfigureAwait(true);
    }

    private void ApplyReplace(
        IReadOnlyList<string> superAdminEmails,
        IReadOnlyDictionary<string, IReadOnlyList<string>> tenantAdmins)
    {
        _state.State.SuperAdminEmails.Clear();
        foreach (var email in superAdminEmails.Select(NormalizeEmail).Distinct(StringComparer.OrdinalIgnoreCase))
        {
            if (!ContainsEmail(_state.State.SuperAdminEmails, email))
            {
                _state.State.SuperAdminEmails.Add(email);
            }
        }

        _state.State.TenantAdminAssignments.Clear();
        foreach (var (tenantId, emails) in tenantAdmins)
        {
            var assignment = CreateAssignment(NormalizeTenantId(tenantId));
            foreach (var email in emails.Select(NormalizeEmail).Distinct(StringComparer.OrdinalIgnoreCase))
            {
                if (!ContainsEmail(assignment.Emails, email))
                {
                    assignment.Emails.Add(email);
                }
            }
        }
    }

    private TenantAdminAssignment CreateAssignment(string tenantId)
    {
        var assignment = new TenantAdminAssignment { TenantId = tenantId };
        _state.State.TenantAdminAssignments.Add(assignment);
        return assignment;
    }

    private TenantAdminAssignment? FindAssignment(string tenantId) =>
        _state.State.TenantAdminAssignments.FirstOrDefault(
            assignment => string.Equals(assignment.TenantId, tenantId, StringComparison.OrdinalIgnoreCase));

    private static string NormalizeEmail(string email)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(email);
        return email.Trim().ToUpperInvariant();
    }

    private static string NormalizeTenantId(string tenantId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(tenantId);
        return tenantId.Trim();
    }

    private static bool ContainsEmail(IEnumerable<string> emails, string normalizedEmail) =>
        FindEmail(emails, normalizedEmail) is not null;

    private static string? FindEmail(IEnumerable<string> emails, string normalizedEmail) =>
        emails.FirstOrDefault(email => string.Equals(email.Trim().ToUpperInvariant(), normalizedEmail, StringComparison.Ordinal));
}
