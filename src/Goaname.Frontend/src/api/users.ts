import { setAccessToken, setPermissions, setRoles, TENANT_ID } from './auth';
import { apiFetch } from './http';

export { TENANT_ID };
export type KycStatus = 'NotStarted' | 'Pending' | 'Verified';

export const PAYOUT_PROVIDERS = {
  mobileMoney: 'mobile-money',
  bankAccount: 'bank-account',
} as const;

export interface UserProfile {
  userId: string;
  tenantId: string;
  displayName: string;
  email: string;
  preferredCurrency: string;
  kycStatus: KycStatus;
  payoutProvider?: string | null;
  payoutAccountId?: string | null;
  payoutAccountVerifiedAt?: string | null;
  withdrawalsEnabled: boolean;
  lastActiveAt: string;
  roles?: string[];
  permissions?: string[];
}

export interface Wallet {
  userId: string;
  currency: string;
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalWon: number;
  totalLost: number;
  status: string;
  lastUpdated: string;
}

export interface DevTokenResponse {
  accessToken: string;
  userId: string;
  tenantId: string;
  expiresAt: string;
}

export async function issueDevToken(displayName = 'Demo User'): Promise<DevTokenResponse> {
  const result = await apiFetch<DevTokenResponse>('/api/auth/dev-token', {
    method: 'POST',
    body: JSON.stringify({ tenantId: TENANT_ID, displayName, email: 'demo@goaname.local' }),
  });
  setAccessToken(result.accessToken);
  return result;
}

export async function getCurrentUser(): Promise<UserProfile> {
  const profile = await apiFetch<UserProfile>(`/api/tenants/${TENANT_ID}/users/me`);
  if (profile.roles?.length) {
    setRoles(profile.roles);
  }

  if (profile.permissions?.length) {
    setPermissions(profile.permissions);
  }

  return profile;
}

export async function getWallet(): Promise<Wallet> {
  return apiFetch<Wallet>(`/api/tenants/${TENANT_ID}/users/me/wallet`);
}

export async function depositFunds(amount: number): Promise<Wallet> {
  return apiFetch<Wallet>(`/api/tenants/${TENANT_ID}/users/me/deposit`, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
}

export async function updateCurrency(currency: string): Promise<UserProfile> {
  return apiFetch<UserProfile>(`/api/tenants/${TENANT_ID}/users/me/currency`, {
    method: 'PATCH',
    body: JSON.stringify({ currency }),
  });
}

export async function linkPayoutAccount(provider: string, accountId: string): Promise<UserProfile> {
  return apiFetch<UserProfile>(`/api/tenants/${TENANT_ID}/users/me/payout-account`, {
    method: 'POST',
    body: JSON.stringify({ provider, accountId }),
  });
}

export async function verifyPayoutAccount(): Promise<UserProfile> {
  return apiFetch<UserProfile>(`/api/tenants/${TENANT_ID}/users/me/payout-account/verify`, {
    method: 'POST',
  });
}

export function normalizeCurrency(currency: string): 'USD' | 'ETB' {
  const upper = currency.toUpperCase();
  if (upper === 'ETB') {
    return 'ETB';
  }
  return 'USD';
}

export function formatMoney(amount: number, currency: string): string {
  return formatPreciseMoney(amount, currency);
}

export function formatPreciseMoney(amount: number, currency: string): string {
  const normalized = normalizeCurrency(currency);
  const safeAmount = Number.isFinite(amount) ? amount : 0;

  if (normalized === 'ETB') {
    const formatted = safeAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `ETB ${formatted}`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);
}
