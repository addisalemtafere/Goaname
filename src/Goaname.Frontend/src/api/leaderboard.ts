import { formatVolume } from './activity';
import { TENANT_ID } from './auth';
import { publicFetch } from './http';

export { TENANT_ID };

export interface LeaderboardStats {
  activeTraders: number;
  weeklyVolume: number;
  topWinRate: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  pnl: number;
  winRate: number;
  volume: number;
  trades: number;
}

export interface Leaderboard {
  stats: LeaderboardStats;
  entries: LeaderboardEntry[];
}

export async function getLeaderboard(limit = 25): Promise<Leaderboard> {
  return publicFetch<Leaderboard>(`/api/tenants/${TENANT_ID}/leaderboard?limit=${limit}`);
}

export function formatTraderId(userId: string): string {
  const compact = userId.replace(/-/g, '');
  return `${compact.slice(0, 4)}…${compact.slice(-2)}`;
}

export function formatPnl(amount: number): string {
  const prefix = amount >= 0 ? '+' : '-';
  return `${prefix}$${Math.abs(amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export { formatVolume };
