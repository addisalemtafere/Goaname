import { apiFetch } from './http';
import { fetchPermissionMatrix } from './permissionMatrix';

export type TenantOperationalStatus = 'Active' | 'Suspended' | 'Maintenance';

export type KycStatus = 'NotStarted' | 'Pending' | 'Verified';

export interface TenantSummary {
  tenantId: string;
  name: string;
  operationalStatus: TenantOperationalStatus;
  bettingEnabled: boolean;
  currency: string;
  lastUpdatedAt: string;
}

export interface TenantSettings {
  name?: string;
  operationalStatus?: TenantOperationalStatus;
  bettingEnabled?: boolean;
  depositsEnabled?: boolean;
  withdrawalsEnabled?: boolean;
  platformFeePercent?: number;
  maxBetAmount?: number;
  defaultLiquidityParameter?: number;
  themeKey?: string | null;
  suspensionReason?: string | null;
}

export interface UserSummary {
  userId: string;
  displayName: string;
  email: string;
  kycStatus: KycStatus;
  balance: number;
  currency: string;
  lastActiveAt: string;
  roles: string[];
}

export interface AdminUser {
  userId: string;
  tenantId: string;
  displayName: string;
  email: string;
  preferredCurrency: string;
  kycStatus: KycStatus;
  payoutProvider?: string | null;
  payoutAccountId?: string | null;
  payoutAccountVerifiedAt?: string | null;
  createdAt: string;
  lastActiveAt: string;
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  roles: string[];
}

export interface OAuthClient {
  clientId: string;
  displayName: string;
  clientType: string;
  permissions: string[];
  redirectUris: string[];
}

export interface CreateOAuthClientRequest {
  clientId: string;
  displayName: string;
  clientType?: string;
  redirectUris?: string[];
  permissions?: string[];
}

export interface AppSettings {
  spaClientId: string;
  tokenLifetimeHours: number;
  localAuthEnabled: boolean;
  superAdminEmails: string[];
  tenantAdmins: Record<string, string[]>;
}

export interface BackOfficeOverview {
  tenantCount: number;
  userCount: number;
  oauthClientCount: number;
  activeTenantId: string;
}

export async function getBackOfficeOverview(tenantId: string): Promise<BackOfficeOverview> {
  const data = await apiFetch<BackOfficeOverview & { oAuthClientCount?: number }>(
    `/api/tenants/${tenantId}/admin/overview`,
  );

  return {
    ...data,
    oauthClientCount: data.oauthClientCount ?? data.oAuthClientCount ?? 0,
  };
}

export async function listAdminTenants(): Promise<TenantSummary[]> {
  return apiFetch<TenantSummary[]>('/api/admin/tenants');
}

export async function updateTenantSettings(tenantId: string, settings: TenantSettings): Promise<unknown> {
  return apiFetch(`/api/tenants/${tenantId}/admin/settings`, {
    method: 'PATCH',
    body: JSON.stringify(settings),
  });
}

export async function listAdminUsers(tenantId: string): Promise<UserSummary[]> {
  return apiFetch<UserSummary[]>(`/api/tenants/${tenantId}/admin/users`);
}

export async function getAdminUser(tenantId: string, userId: string): Promise<AdminUser> {
  return apiFetch<AdminUser>(`/api/tenants/${tenantId}/admin/users/${userId}`);
}

export async function adjustUserWallet(tenantId: string, userId: string, amount: number): Promise<unknown> {
  return apiFetch(`/api/tenants/${tenantId}/admin/users/${userId}/wallet`, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
}

export async function setUserKycStatus(tenantId: string, userId: string, status: KycStatus): Promise<AdminUser> {
  return apiFetch<AdminUser>(`/api/tenants/${tenantId}/admin/users/${userId}/kyc`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function listOAuthClients(): Promise<OAuthClient[]> {
  return apiFetch<OAuthClient[]>('/api/admin/clients');
}

export async function createOAuthClient(request: CreateOAuthClientRequest): Promise<OAuthClient> {
  return apiFetch<OAuthClient>('/api/admin/clients', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function updateOAuthClient(clientId: string, request: {
  displayName: string;
  redirectUris?: string[];
  permissions?: string[];
}): Promise<OAuthClient> {
  return apiFetch<OAuthClient>(`/api/admin/clients/${encodeURIComponent(clientId)}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  });
}

export async function deleteOAuthClient(clientId: string): Promise<void> {
  await apiFetch<void>(`/api/admin/clients/${encodeURIComponent(clientId)}`, { method: 'DELETE' });
}

export async function getAppSettings(): Promise<AppSettings> {
  return apiFetch<AppSettings>('/api/admin/app-settings');
}

export interface RoleRegistry {
  superAdminEmails: string[];
  tenantAdmins: Record<string, string[]>;
}

export async function getRoleRegistry(): Promise<RoleRegistry> {
  return apiFetch<RoleRegistry>('/api/admin/roles');
}

export async function updateRoleRegistry(registry: RoleRegistry): Promise<RoleRegistry> {
  return apiFetch<RoleRegistry>('/api/admin/roles', {
    method: 'PUT',
    body: JSON.stringify(registry),
  });
}

export async function grantSuperAdmin(email: string): Promise<RoleRegistry> {
  return apiFetch<RoleRegistry>('/api/admin/roles/super-admins', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function revokeSuperAdmin(email: string): Promise<RoleRegistry> {
  return apiFetch<RoleRegistry>(`/api/admin/roles/super-admins/${encodeURIComponent(email)}`, {
    method: 'DELETE',
  });
}

export async function grantTenantAdmin(tenantId: string, email: string): Promise<RoleRegistry> {
  return apiFetch<RoleRegistry>('/api/admin/roles/tenant-admins', {
    method: 'POST',
    body: JSON.stringify({ tenantId, email }),
  });
}

export async function revokeTenantAdmin(tenantId: string, email: string): Promise<RoleRegistry> {
  return apiFetch<RoleRegistry>('/api/admin/roles/tenant-admins', {
    method: 'DELETE',
    body: JSON.stringify({ tenantId, email }),
  });
}

export async function grantTenantAdminForTenant(tenantId: string, email: string): Promise<RoleRegistry> {
  return apiFetch<RoleRegistry>(`/api/tenants/${tenantId}/admin/roles/tenant-admins/grant`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function revokeTenantAdminForTenant(tenantId: string, email: string): Promise<RoleRegistry> {
  return apiFetch<RoleRegistry>(`/api/tenants/${tenantId}/admin/roles/tenant-admins/revoke`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export interface PermissionDefinition {
  name: string;
  displayName: string;
  groupName: string;
  parentName?: string | null;
}

export interface RolePermissionMatrix {
  permissions: PermissionDefinition[];
  rolePermissions: Record<string, string[]>;
}

export async function getPermissionMatrix(): Promise<RolePermissionMatrix> {
  return fetchPermissionMatrix(() => apiFetch<RolePermissionMatrix>('/api/admin/permissions'));
}

export async function getTenantPermissionMatrix(tenantId: string): Promise<RolePermissionMatrix> {
  return fetchPermissionMatrix(() =>
    apiFetch<RolePermissionMatrix>(`/api/tenants/${tenantId}/admin/permissions`),
  );
}
