import { parseJsonResponse, readErrorMessage } from './client';
import {
  clearPermissions,
  getPermissions,
  hasPermission,
  hasAnyPermission,
  setPermissions,
  canAccessAdminPanel,
  canAccessAdmin as evaluateCanAccessAdmin,
  GoanamePermissions,
} from './permissions';
import { resolvePermissionsForRoles } from './permissionCatalog';

export const TENANT_ID = 'demo';

export const GoanameRoles = {
  User: 'User',
  TenantAdmin: 'TenantAdmin',
  SuperAdmin: 'SuperAdmin',
} as const;

export type GoanameRole = (typeof GoanameRoles)[keyof typeof GoanameRoles];

export interface AuthResponse {
  accessToken: string;
  userId: string;
  tenantId: string;
  displayName: string;
  email: string;
  expiresAt: string;
  roles: string[];
}

const TOKEN_KEY = 'goaname.accessToken';
const ROLES_KEY = 'goaname.roles';

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getRoles(): string[] {
  const raw = localStorage.getItem(ROLES_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((role): role is string => typeof role === 'string') : [];
  } catch {
    return [];
  }
}

export function setRoles(roles: string[]): void {
  localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
}

export function clearRoles(): void {
  localStorage.removeItem(ROLES_KEY);
}

export function hasRole(role: string): boolean {
  return getRoles().includes(role);
}

export function isSuperAdmin(): boolean {
  return hasRole(GoanameRoles.SuperAdmin);
}

export function isTenantAdmin(): boolean {
  return hasRole(GoanameRoles.TenantAdmin) || isSuperAdmin();
}

export function canAccessAdmin(): boolean {
  return evaluateCanAccessAdmin(getRoles(), getPermissions());
}

export function getEffectiveRole(roles: string[]): GoanameRole {
  if (roles.includes(GoanameRoles.SuperAdmin)) {
    return GoanameRoles.SuperAdmin;
  }

  if (roles.includes(GoanameRoles.TenantAdmin)) {
    return GoanameRoles.TenantAdmin;
  }

  return GoanameRoles.User;
}

export function isPlayerRole(roles: string[]): boolean {
  return getEffectiveRole(roles) === GoanameRoles.User;
}

function persistAuth(result: AuthResponse): void {
  setAccessToken(result.accessToken);
  setRoles(result.roles ?? []);
}

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');

  const response = await fetch(path, { ...init, headers });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return parseJsonResponse<T>(response);
}

export async function register(
  displayName: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const result = await authFetch<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ tenantId: TENANT_ID, displayName, email, password }),
  });
  persistAuth(result);
  return result;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const result = await authFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ tenantId: TENANT_ID, email, password }),
  });
  persistAuth(result);
  return result;
}

export function logout(): void {
  clearAccessToken();
  clearRoles();
  clearPermissions();
}

export {
  clearPermissions,
  getPermissions,
  hasPermission,
  hasAnyPermission,
  setPermissions,
  canAccessAdminPanel,
  evaluateCanAccessAdmin,
  resolvePermissionsForRoles,
  GoanamePermissions,
};
