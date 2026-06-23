import type { RolePermissionMatrix } from './admin';
import { GoanameRoles } from './auth';
import { PERMISSION_DEFINITIONS, resolvePermissionsForRoles } from './permissionCatalog';

export function buildLocalPermissionMatrix(): RolePermissionMatrix {
  return {
    permissions: PERMISSION_DEFINITIONS,
    rolePermissions: {
      [GoanameRoles.SuperAdmin]: resolvePermissionsForRoles([GoanameRoles.SuperAdmin]),
      [GoanameRoles.TenantAdmin]: resolvePermissionsForRoles([GoanameRoles.TenantAdmin]),
      [GoanameRoles.User]: resolvePermissionsForRoles([GoanameRoles.User]),
    },
  };
}

async function withPermissionMatrixFallback<T>(fetch: () => Promise<T>, fallback: () => T): Promise<T> {
  try {
    return await fetch();
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('404') || message.includes('Not Found')) {
      return fallback();
    }

    throw error;
  }
}

export async function fetchPermissionMatrix(fetch: () => Promise<RolePermissionMatrix>): Promise<RolePermissionMatrix> {
  return withPermissionMatrixFallback(fetch, buildLocalPermissionMatrix);
}
