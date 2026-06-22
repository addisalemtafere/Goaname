import { TENANT_ID } from './auth';
import { apiFetch } from './http';
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

export type BetStatus = 'Pending' | 'Won' | 'Lost' | 'Cancelled' | 'Refunded';

export interface BetHistoryItem {
  betSlipId: string;
  marketId: string;
  marketTitle: string;
  category: string;
  outcome: BetOutcome;
  amount: number;
  sharesReceived: number;
  oddsAtPlacement: number;
  status: BetStatus;
  settlementAmount?: number | null;
  placedAt: string;
  settledAt?: string | null;
}

export async function listMyBets(limit = 50): Promise<BetHistoryItem[]> {
  return apiFetch<BetHistoryItem[]>(`/api/tenants/${TENANT_ID}/users/me/bets?limit=${limit}`);
}
