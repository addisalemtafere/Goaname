import { getAccessToken, TENANT_ID } from './auth';
import { parseJsonResponse, readErrorMessage } from './client';
import type { OddsSnapshot } from './markets';

export { TENANT_ID };

export type BetOutcome = 'Yes' | 'No';

export interface PlaceBetBodyRequest {
  outcome: BetOutcome;
  amount: number;
}

export interface PlaceBetResponse {
  betSlipId: string;
  oddsAtPlacement: number;
  sharesReceived: number;
  updatedOdds: OddsSnapshot;
  walletBalance: number;
  currency: string;
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

export async function placeBet(
  marketId: string,
  request: PlaceBetBodyRequest,
  tenantId: string = TENANT_ID,
): Promise<PlaceBetResponse> {
  return apiFetch<PlaceBetResponse>(`/api/tenants/${tenantId}/markets/${marketId}/bets`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function betSideToOutcome(side: 'yes' | 'no'): BetOutcome {
  return side === 'yes' ? 'Yes' : 'No';
}
