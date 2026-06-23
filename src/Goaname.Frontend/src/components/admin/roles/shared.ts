import { GoanameRoles } from '../../../api/auth';
import type { RoleRegistry } from '../../../api/admin';

export interface SystemRole {
  key: string;
  name: string;
  description: string;
}

export const SYSTEM_ROLES: SystemRole[] = [
  {
    key: GoanameRoles.SuperAdmin,
    name: 'Super admin',
    description: 'Full platform and tenant administration',
  },
  {
    key: GoanameRoles.TenantAdmin,
    name: 'Tenant admin',
    description: 'Manage markets, users, and tenant settings',
  },
  {
    key: GoanameRoles.User,
    name: 'Player',
    description: 'Place bets and manage wallet',
  },
];

export function formatAdminEmail(email: string): string {
  return email.includes('@') ? email.toLowerCase() : email;
}

export function countRoleAssignments(roleKey: string, registry: RoleRegistry | null): number {
  if (!registry) {
    return 0;
  }

  if (roleKey === GoanameRoles.SuperAdmin) {
    return registry.superAdminEmails.length;
  }

  if (roleKey === GoanameRoles.TenantAdmin) {
    return Object.values(registry.tenantAdmins).reduce((total, emails) => total + emails.length, 0);
  }

  return 0;
}
