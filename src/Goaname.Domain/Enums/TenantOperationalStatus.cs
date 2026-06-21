namespace Goaname.Domain.Enums;

/// <summary>
/// Tenant-wide operational state. When not Active, all markets are effectively disabled.
/// </summary>
public enum TenantOperationalStatus
{
    Active,
    Suspended,
    Maintenance
}
