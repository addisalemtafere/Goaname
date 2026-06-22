import { TENANT_ID } from './auth';
import { publicFetch } from './http';

export { TENANT_ID };

export type ActivityKind = 'buy_yes' | 'buy_no' | 'sell' | 'market_open';

export interface ActivityFeedItem {
  id: string;
  placedAt: string;
  traderLabel: string;
  kind: ActivityKind;
  marketTitle: string;
  category: string;
  amount: number;
  shares?: number | null;
}

export interface ActivityStats {
  volume24h: number;
  betsToday: number;
  activeMarkets: number;
}

export interface ActivityFeed {
  stats: ActivityStats;
  items: ActivityFeedItem[];
}

export async function listActivity(limit = 50): Promise<ActivityFeed> {
  return publicFetch<ActivityFeed>(`/api/tenants/${TENANT_ID}/activity?limit=${limit}`);
}

export function formatVolume(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }

  if (amount >= 1_000) {
    return `$${Math.round(amount / 1_000)}K`;
  }

  return `$${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function formatTimeAgo(isoDate: string): string {
  const then = new Date(isoDate).getTime();
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));

  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
