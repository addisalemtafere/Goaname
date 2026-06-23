export type ActivityKind = 'buy_yes' | 'buy_no' | 'sell' | 'market_open';

export type ActivityFilter = 'all' | ActivityKind;

export interface ActivityFeedItem {
  id: string;
  timeAgo: string;
  wallet: string;
  kind: ActivityKind;
  market: string;
  category: string;
  amount: number;
  shares?: number;
}

export const mockActivityFeed: ActivityFeedItem[] = [
  { id: '1', timeAgo: '2m ago', wallet: '0x9f…44', kind: 'buy_yes', category: 'Crypto', market: 'Will Bitcoin hit $150k before 2027?', amount: 12480, shares: 42 },
  { id: '2', timeAgo: '4m ago', wallet: '0x3a…b2', kind: 'buy_no', category: 'Economy', market: 'Fed rate cut in Q3 2025?', amount: 8200, shares: 35 },
  { id: '3', timeAgo: '7m ago', wallet: '0x7c…91', kind: 'sell', category: 'Pop Culture', market: 'Taylor Swift album #1 this year?', amount: 5600 },
  { id: '4', timeAgo: '11m ago', wallet: '0x1e…ff', kind: 'buy_yes', category: 'Science', market: 'SpaceX Starship orbit success', amount: 15200, shares: 60 },
  { id: '5', timeAgo: '14m ago', wallet: '0x8b…23', kind: 'market_open', category: 'Politics', market: 'US election turnout above 65%?', amount: 0 },
  { id: '6', timeAgo: '18m ago', wallet: '0x4d…67', kind: 'buy_no', category: 'Crypto', market: 'Ethereum flips Bitcoin market cap', amount: 9400, shares: 28 },
  { id: '7', timeAgo: '22m ago', wallet: '0x2f…18', kind: 'buy_yes', category: 'Tech', market: 'AI passes bar exam in all states', amount: 3100, shares: 15 },
  { id: '8', timeAgo: '28m ago', wallet: '0x6a…55', kind: 'buy_yes', category: 'Sports', market: 'Chiefs win Super Bowl 2026', amount: 7800, shares: 39 },
  { id: '9', timeAgo: '35m ago', wallet: '0x5c…09', kind: 'sell', category: 'Economy', market: 'Oil above $90 by December', amount: 4200 },
  { id: '10', timeAgo: '41m ago', wallet: '0x0b…72', kind: 'buy_no', category: 'Economy', market: 'Global recession in 2025?', amount: 6700, shares: 31 },
  { id: '11', timeAgo: '48m ago', wallet: '0x9f…44', kind: 'buy_yes', category: 'Tech', market: 'Apple launches foldable iPhone', amount: 11500, shares: 44 },
  { id: '12', timeAgo: '55m ago', wallet: '0x3a…b2', kind: 'buy_yes', category: 'Tech', market: 'OpenAI IPO in 2026', amount: 8900, shares: 37 },
];

export const activityStats = {
  volume24h: '$842K',
  betsToday: '3,218',
  activeMarkets: '102',
};
