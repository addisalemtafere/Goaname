export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  wallet: string;
  pnl: number;
  winRate: number;
  volume: number;
  trades: number;
}

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, displayName: 'AlphaWhale', wallet: '0x9f…44', pnl: 48250, winRate: 68, volume: 312000, trades: 184 },
  { rank: 2, displayName: 'PolyKing', wallet: '0x3a…b2', pnl: 39120, winRate: 64, volume: 278400, trades: 156 },
  { rank: 3, displayName: 'EdgeRunner', wallet: '0x7c…91', pnl: 28400, winRate: 61, volume: 195600, trades: 132 },
  { rank: 4, displayName: 'YesMachine', wallet: '0x1e…ff', pnl: 22180, winRate: 58, volume: 168200, trades: 118 },
  { rank: 5, displayName: 'MacroMaven', wallet: '0x8b…23', pnl: 19450, winRate: 57, volume: 142800, trades: 97 },
  { rank: 6, displayName: 'CryptoSage', wallet: '0x4d…67', pnl: 16200, winRate: 55, volume: 121500, trades: 88 },
  { rank: 7, displayName: 'OddsOracle', wallet: '0x2f…18', pnl: 13840, winRate: 54, volume: 98400, trades: 76 },
  { rank: 8, displayName: 'NightTrader', wallet: '0x6a…55', pnl: 11290, winRate: 52, volume: 87600, trades: 64 },
  { rank: 9, displayName: 'VolatilityV', wallet: '0x5c…09', pnl: 9870, winRate: 51, volume: 74200, trades: 59 },
  { rank: 10, displayName: 'SteadyHands', wallet: '0x0b…72', pnl: 8540, winRate: 50, volume: 65800, trades: 52 },
];
