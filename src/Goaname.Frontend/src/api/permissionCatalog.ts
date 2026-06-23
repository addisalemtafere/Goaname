import type { PermissionDefinition } from './admin';
import { GoanamePermissions } from './permissions';

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  { name: GoanamePermissions.Platform.Tenants, displayName: 'Manage tenants', groupName: GoanamePermissions.Platform.GroupName, parentName: GoanamePermissions.Platform.Default },
  { name: GoanamePermissions.Platform.Roles, displayName: 'Manage roles', groupName: GoanamePermissions.Platform.GroupName, parentName: GoanamePermissions.Platform.Default },
  { name: GoanamePermissions.Platform.Clients, displayName: 'Manage OAuth clients', groupName: GoanamePermissions.Platform.GroupName, parentName: GoanamePermissions.Platform.Default },
  { name: GoanamePermissions.Platform.Settings, displayName: 'Platform settings', groupName: GoanamePermissions.Platform.GroupName, parentName: GoanamePermissions.Platform.Default },
  { name: GoanamePermissions.Platform.Dashboard, displayName: 'Orleans dashboard', groupName: GoanamePermissions.Platform.GroupName, parentName: GoanamePermissions.Platform.Default },
  { name: GoanamePermissions.TenantAdmin.Overview, displayName: 'Tenant overview', groupName: GoanamePermissions.TenantAdmin.GroupName, parentName: GoanamePermissions.TenantAdmin.Default },
  { name: GoanamePermissions.TenantAdmin.Markets, displayName: 'Manage markets', groupName: GoanamePermissions.TenantAdmin.GroupName, parentName: GoanamePermissions.TenantAdmin.Default },
  { name: GoanamePermissions.TenantAdmin.Categories, displayName: 'Manage categories', groupName: GoanamePermissions.TenantAdmin.GroupName, parentName: GoanamePermissions.TenantAdmin.Default },
  { name: GoanamePermissions.TenantAdmin.Users, displayName: 'View users', groupName: GoanamePermissions.TenantAdmin.GroupName, parentName: GoanamePermissions.TenantAdmin.Default },
  { name: GoanamePermissions.TenantAdmin.UsersAdjustWallet, displayName: 'Adjust player wallets', groupName: GoanamePermissions.TenantAdmin.GroupName, parentName: GoanamePermissions.TenantAdmin.Users },
  { name: GoanamePermissions.TenantAdmin.UsersSetKyc, displayName: 'Update KYC status', groupName: GoanamePermissions.TenantAdmin.GroupName, parentName: GoanamePermissions.TenantAdmin.Users },
  { name: GoanamePermissions.TenantAdmin.UsersGrantAdmin, displayName: 'Grant tenant admin', groupName: GoanamePermissions.TenantAdmin.GroupName, parentName: GoanamePermissions.TenantAdmin.Users },
  { name: GoanamePermissions.TenantAdmin.Settings, displayName: 'Tenant settings', groupName: GoanamePermissions.TenantAdmin.GroupName, parentName: GoanamePermissions.TenantAdmin.Default },
  { name: GoanamePermissions.User.Bets, displayName: 'Place bets', groupName: GoanamePermissions.User.GroupName, parentName: GoanamePermissions.User.Default },
  { name: GoanamePermissions.User.Profile, displayName: 'Manage profile', groupName: GoanamePermissions.User.GroupName, parentName: GoanamePermissions.User.Default },
  { name: GoanamePermissions.User.Wallet, displayName: 'Manage wallet', groupName: GoanamePermissions.User.GroupName, parentName: GoanamePermissions.User.Default },
];

export const ALL_PERMISSION_NAMES = PERMISSION_DEFINITIONS.map((item) => item.name);

/** Matches backend GoanameRolePermissions role map. */
export const ROLE_PERMISSION_GRANTS: Record<string, readonly string[]> = {
  SuperAdmin: ALL_PERMISSION_NAMES,
  TenantAdmin: [
    GoanamePermissions.TenantAdmin.Overview,
    GoanamePermissions.TenantAdmin.Markets,
    GoanamePermissions.TenantAdmin.Categories,
    GoanamePermissions.TenantAdmin.Users,
    GoanamePermissions.TenantAdmin.UsersAdjustWallet,
    GoanamePermissions.TenantAdmin.UsersSetKyc,
    GoanamePermissions.TenantAdmin.UsersGrantAdmin,
    GoanamePermissions.TenantAdmin.Settings,
    GoanamePermissions.User.Bets,
    GoanamePermissions.User.Profile,
    GoanamePermissions.User.Wallet,
  ],
  User: [
    GoanamePermissions.User.Bets,
    GoanamePermissions.User.Profile,
    GoanamePermissions.User.Wallet,
  ],
};

/** Fallback when /me does not yet return permissions. */
export function resolvePermissionsForRoles(roles: string[]): string[] {
  if (roles.includes('SuperAdmin')) {
    return [...ROLE_PERMISSION_GRANTS.SuperAdmin];
  }

  if (roles.includes('TenantAdmin')) {
    return [...ROLE_PERMISSION_GRANTS.TenantAdmin];
  }

  return [...ROLE_PERMISSION_GRANTS.User];
}

export function groupPermissionsByName(permissions: PermissionDefinition[]) {
  const groups = new Map<string, PermissionDefinition[]>();
  for (const permission of permissions) {
    const list = groups.get(permission.groupName) ?? [];
    list.push(permission);
    groups.set(permission.groupName, list);
  }
  return [...groups.entries()];
}

export interface PermissionSection {
  title: string;
  permissions: PermissionDefinition[];
}

function permissionParentLabel(parentName: string): string {
  const parent = PERMISSION_DEFINITIONS.find((item) => item.name === parentName);
  if (parent) {
    return parent.displayName;
  }

  if (parentName.endsWith('.Default')) {
    return 'General';
  }

  return parentName.split('.').pop() ?? parentName;
}

export function buildPermissionSections(permissions: PermissionDefinition[]): PermissionSection[] {
  const byParent = new Map<string, PermissionDefinition[]>();

  for (const permission of permissions) {
    const parentKey = permission.parentName ?? permission.name;
    const list = byParent.get(parentKey) ?? [];
    list.push(permission);
    byParent.set(parentKey, list);
  }

  return [...byParent.entries()].map(([parentKey, items]) => ({
    title: permissionParentLabel(parentKey),
    permissions: [...items].sort((left, right) => left.displayName.localeCompare(right.displayName)),
  }));
}

export function areAllGranted(granted: string[], permissions: PermissionDefinition[]): boolean {
  return permissions.length > 0 && permissions.every((item) => granted.includes(item.name));
}

export function countGrantedInSet(granted: string[], permissions: PermissionDefinition[]): number {
  return permissions.filter((item) => granted.includes(item.name)).length;
}

export function permissionsEqual(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  const set = new Set(left);
  return right.every((name) => set.has(name));
}

export function togglePermissionGrant(granted: string[], permissionName: string): string[] {
  return granted.includes(permissionName)
    ? granted.filter((name) => name !== permissionName)
    : [...granted, permissionName];
}

export function toggleAllGrants(granted: string[], permissions: PermissionDefinition[]): string[] {
  if (areAllGranted(granted, permissions)) {
    const remove = new Set(permissions.map((item) => item.name));
    return granted.filter((name) => !remove.has(name));
  }

  const next = new Set(granted);
  for (const permission of permissions) {
    next.add(permission.name);
  }

  return [...next];
}
