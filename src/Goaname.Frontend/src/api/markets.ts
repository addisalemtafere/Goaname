import { parseJsonResponse, readErrorMessage } from './client';
import { TENANT_ID } from './auth';

export { TENANT_ID };

export const MARKET_STATUS = {
  Draft: 0,
  Open: 1,
  Closing: 2,
  Resolved: 3,
  Settled: 4,
  Cancelled: 5,
} as const;

export type MarketStatus = (typeof MARKET_STATUS)[keyof typeof MARKET_STATUS];

const MARKET_STATUS_LABELS: Record<MarketStatus, string> = {
  [MARKET_STATUS.Draft]: 'Draft',
  [MARKET_STATUS.Open]: 'Open',
  [MARKET_STATUS.Closing]: 'Closing',
  [MARKET_STATUS.Resolved]: 'Resolved',
  [MARKET_STATUS.Settled]: 'Settled',
  [MARKET_STATUS.Cancelled]: 'Cancelled',
};

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
  return MARKET_STATUS_LABELS[status] ?? 'Unknown';
}

export function isDraftMarket(market: MarketDto): boolean {
  return market.status === MARKET_STATUS.Draft;
}

export async function listMarkets(tenantId: string = TENANT_ID): Promise<MarketDto[]> {
  const response = await fetch(`/api/tenants/${tenantId}/markets`);
  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return parseJsonResponse<MarketDto[]>(response);
}

export async function listAdminMarkets(tenantId: string = TENANT_ID): Promise<MarketDto[]> {
  const response = await fetch(`/api/tenants/${tenantId}/admin/markets`);
  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return parseJsonResponse<MarketDto[]>(response);
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

export async function createMarket(
  request: CreateMarketRequest,
  tenantId: string = TENANT_ID,
): Promise<MarketDto> {
  const response = await fetch(`/api/tenants/${tenantId}/admin/markets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return parseJsonResponse<MarketDto>(response);
}

export async function publishMarket(marketId: string, tenantId: string = TENANT_ID): Promise<MarketDto> {
  const response = await fetch(`/api/tenants/${tenantId}/admin/markets/${marketId}/publish`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return parseJsonResponse<MarketDto>(response);
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
