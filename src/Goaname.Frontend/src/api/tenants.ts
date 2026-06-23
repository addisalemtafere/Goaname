import { apiFetch } from './http';
import { TENANT_ID } from './auth';

export { TENANT_ID };

export interface TenantDto {
  tenantId: string;
  name: string;
  currency: string;
  operationalStatus?: 'Active' | 'Suspended' | 'Maintenance';
  bettingEnabled: boolean;
  depositsEnabled: boolean;
  withdrawalsEnabled: boolean;
  platformFeePercent?: number;
  maxBetAmount?: number;
  defaultLiquidityParameter?: number;
  themeKey?: string | null;
  suspensionReason?: string | null;
  enabledCategories?: string[];
}

export interface InitializeTenantRequest {
  name: string;
  currency: string;
}

export async function getTenant(tenantId: string = TENANT_ID): Promise<TenantDto> {
  return apiFetch<TenantDto>(`/api/tenants/${tenantId}`, undefined, { auth: false });
}

export async function initializeTenant(
  request: InitializeTenantRequest,
  tenantId: string,
): Promise<TenantDto> {
  return apiFetch<TenantDto>(`/api/tenants/${tenantId}/initialize`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function updateTenantBetting(enabled: boolean, tenantId: string): Promise<void> {
  await apiFetch<void>(`/api/tenants/${tenantId}/betting`, {
    method: 'POST',
    body: JSON.stringify({ enabled }),
  });
}
