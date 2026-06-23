import { parseJsonResponse, readErrorMessage } from './client';
import { apiFetch } from './http';
import { TENANT_ID } from './auth';
import type { BetStatus } from './bets';

export { TENANT_ID };

export const MARKET_STATUS = {
  Draft: 0,
  Open: 1,
  Closing: 2,
  Resolved: 3,
  Settled: 4,
  Cancelled: 5,
} as const;

export type MarketStatusName = 'Draft' | 'Open' | 'Closing' | 'Resolved' | 'Settled' | 'Cancelled';

export type MarketStatus = MarketStatusName | (typeof MARKET_STATUS)[keyof typeof MARKET_STATUS];

const MARKET_STATUS_LABELS: Record<MarketStatusName, string> = {
  Draft: 'Draft',
  Open: 'Open',
  Closing: 'Closing',
  Resolved: 'Resolved',
  Settled: 'Settled',
  Cancelled: 'Cancelled',
};

const MARKET_STATUS_BY_NUMBER: MarketStatusName[] = [
  'Draft',
  'Open',
  'Closing',
  'Resolved',
  'Settled',
  'Cancelled',
];

export function normalizeMarketStatus(status: MarketStatus): MarketStatusName {
  if (typeof status === 'string') {
    return status in MARKET_STATUS_LABELS ? (status as MarketStatusName) : 'Draft';
  }

  return MARKET_STATUS_BY_NUMBER[status] ?? 'Draft';
}

export interface MarketDto {
  id: string;
  tenantId: string;
  title: string;
  category: string;
  status: MarketStatus;
  tradingEndsAt: string;
  yesProbability: number;
  noProbability: number;
  yesMultiplier: number;
  noMultiplier: number;
  totalVolume: number;
  uniqueTraders: number;
  isVisible: boolean;
  winningOutcome?: Outcome | null;
}

export interface OddsSnapshot {
  yesProbability: number;
  noProbability: number;
  yesMultiplier: number;
  noMultiplier: number;
}

export interface CreateMarketRequest {
  title: string;
  category: string;
  tradingEndsAt: string;
  liquidityParameter?: number;
}

export function formatMarketStatus(status: MarketStatus): string {
  return MARKET_STATUS_LABELS[normalizeMarketStatus(status)];
}

export function isDraftMarket(market: MarketDto): boolean {
  return normalizeMarketStatus(market.status) === 'Draft';
}

export function isOpenMarket(market: MarketDto): boolean {
  return normalizeMarketStatus(market.status) === 'Open';
}

export function isClosingMarket(market: MarketDto): boolean {
  return normalizeMarketStatus(market.status) === 'Closing';
}

export function isResolvedMarket(market: MarketDto): boolean {
  return normalizeMarketStatus(market.status) === 'Resolved';
}

export function isSettledMarket(market: MarketDto): boolean {
  return normalizeMarketStatus(market.status) === 'Settled';
}

export function isBettingOpen(market: MarketDto): boolean {
  return normalizeMarketStatus(market.status) === 'Open';
}

export function isPublicMarket(market: MarketDto): boolean {
  const status = normalizeMarketStatus(market.status);
  return market.isVisible && (status === 'Open' || status === 'Closing');
}

export async function listMarkets(tenantId: string = TENANT_ID): Promise<MarketDto[]> {
  const response = await fetch(`/api/tenants/${tenantId}/markets`);
  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const markets = await parseJsonResponse<MarketDto[]>(response);
  return markets.filter(isPublicMarket);
}

export async function listAdminMarkets(tenantId: string = TENANT_ID): Promise<MarketDto[]> {
  return apiFetch<MarketDto[]>(`/api/tenants/${tenantId}/admin/markets`);
}

export async function getMarket(tenantId: string, marketId: string): Promise<MarketDto> {
  const response = await fetch(`/api/tenants/${tenantId}/markets/${marketId}`);
  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return parseJsonResponse<MarketDto>(response);
}

export async function getMarketOdds(tenantId: string, marketId: string): Promise<OddsSnapshot> {
  const response = await fetch(`/api/tenants/${tenantId}/markets/${marketId}/odds`);
  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return parseJsonResponse<OddsSnapshot>(response);
}

export interface MarketBetSummary {
  totalBets: number;
  uniqueTraders: number;
  totalStaked: number;
  yesBets: number;
  noBets: number;
  yesStaked: number;
  noStaked: number;
  pendingBets: number;
  wonBets: number;
  lostBets: number;
  totalPaidOut: number;
}

export interface MarketBetItem {
  betSlipId: string;
  userId: string;
  outcome: Outcome;
  amount: number;
  sharesReceived: number;
  oddsAtPlacement: number;
  status: BetStatus;
  settlementAmount?: number | null;
  placedAt: string;
  settledAt?: string | null;
}

export interface MarketBets {
  summary: MarketBetSummary;
  bets: MarketBetItem[];
}

export async function getMarketBets(
  marketId: string,
  tenantId: string = TENANT_ID,
): Promise<MarketBets> {
  return apiFetch<MarketBets>(`/api/tenants/${tenantId}/admin/markets/${marketId}/bets`);
}

export async function createMarket(
  request: CreateMarketRequest,
  tenantId: string = TENANT_ID,
): Promise<MarketDto> {
  return apiFetch<MarketDto>(`/api/tenants/${tenantId}/admin/markets`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function publishMarket(marketId: string, tenantId: string = TENANT_ID): Promise<MarketDto> {
  return apiFetch<MarketDto>(`/api/tenants/${tenantId}/admin/markets/${marketId}/publish`, {
    method: 'POST',
  });
}

export async function closeMarket(marketId: string, tenantId: string = TENANT_ID): Promise<MarketDto> {
  return apiFetch<MarketDto>(`/api/tenants/${tenantId}/admin/markets/${marketId}/close`, {
    method: 'POST',
  });
}

export type Outcome = 'Yes' | 'No';

export async function resolveMarket(
  marketId: string,
  winningOutcome: Outcome,
  tenantId: string = TENANT_ID,
): Promise<MarketDto> {
  return apiFetch<MarketDto>(`/api/tenants/${tenantId}/admin/markets/${marketId}/resolve`, {
    method: 'POST',
    body: JSON.stringify({ winningOutcome }),
  });
}

export async function settleMarket(marketId: string, tenantId: string = TENANT_ID): Promise<MarketDto> {
  return apiFetch<MarketDto>(`/api/tenants/${tenantId}/admin/markets/${marketId}/settle`, {
    method: 'POST',
  });
}

export function daysUntil(endDate: string): number {
  const end = new Date(endDate).getTime();
  const now = Date.now();
  return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
}

export function toCardPercent(probability: number): number {
  return Math.round(probability * 100);
}

export function defaultTradingEndsAt(): string {
  const date = new Date();
  date.setUTCMonth(date.getUTCMonth() + 1);
  date.setUTCHours(23, 59, 59, 0);
  return date.toISOString();
}
