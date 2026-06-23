export const GoanamePermissions = {
  Platform: {
    GroupName: 'Platform',
    Default: 'Goaname.Platform',
    Tenants: 'Goaname.Platform.Tenants',
    Roles: 'Goaname.Platform.Roles',
    Clients: 'Goaname.Platform.Clients',
    Settings: 'Goaname.Platform.Settings',
    Dashboard: 'Goaname.Platform.Dashboard',
  },
  TenantAdmin: {
    GroupName: 'Tenant administration',
    Default: 'Goaname.TenantAdmin',
    Overview: 'Goaname.TenantAdmin.Overview',
    Markets: 'Goaname.TenantAdmin.Markets',
    Categories: 'Goaname.TenantAdmin.Categories',
    Users: 'Goaname.TenantAdmin.Users',
    UsersAdjustWallet: 'Goaname.TenantAdmin.Users.AdjustWallet',
    UsersSetKyc: 'Goaname.TenantAdmin.Users.SetKyc',
    UsersGrantAdmin: 'Goaname.TenantAdmin.Users.GrantAdmin',
    Settings: 'Goaname.TenantAdmin.Settings',
  },
  User: {
    GroupName: 'Player',
    Default: 'Goaname.User',
    Bets: 'Goaname.User.Bets',
    Profile: 'Goaname.User.Profile',
    Wallet: 'Goaname.User.Wallet',
  },
} as const;

const ROLE_SUPER = 'SuperAdmin';
const ROLE_TENANT = 'TenantAdmin';

const PERMISSIONS_KEY = 'goaname.permissions';

export function getPermissions(): string[] {
  const raw = localStorage.getItem(PERMISSIONS_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : [];
  } catch {
    return [];
  }
}

export function setPermissions(permissions: string[]): void {
  localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions));
}

export function clearPermissions(): void {
  localStorage.removeItem(PERMISSIONS_KEY);
}

export function hasPermission(permissions: string[], permission: string): boolean {
  return permissions.includes(permission);
}

export function hasAnyPermission(permissions: string[], required: string[]): boolean {
  return required.some((permission) => permissions.includes(permission));
}

export function canAccessAdminPanel(permissions: string[]): boolean {
  return permissions.some(
    (permission) =>
      permission.startsWith('Goaname.Platform.') || permission.startsWith('Goaname.TenantAdmin.'),
  );
}

export function canAccessAdmin(roles: string[], permissions: string[]): boolean {
  return (
    canAccessAdminPanel(permissions) ||
    roles.includes(ROLE_SUPER) ||
    roles.includes(ROLE_TENANT)
  );
}
