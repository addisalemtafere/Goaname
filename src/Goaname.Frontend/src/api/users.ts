import { getAccessToken, setAccessToken, TENANT_ID } from './auth';
import { parseJsonResponse, readErrorMessage } from './client';

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

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(path, { ...init, headers });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return parseJsonResponse<T>(response);
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
  return apiFetch<UserProfile>(`/api/tenants/${TENANT_ID}/users/me`);
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
  const normalized = normalizeCurrency(currency);
  const formatted = amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (normalized === 'ETB') {
    return `ETB ${formatted}`;
  }

  return `$${formatted}`;
}
