export interface MarketCardData {
  id: string;
  question: string;
  category: string;
  tag: string;
  daysLeft: number;
  yesPercent: number;
  noPercent: number;
  yesOdds: number;
  noOdds: number;
  volume: number;
  traders: number;
  emoji: string;
}

export const categories = [
  'WORLD CUP',
  'CELEBRITY',
  'EVENTS',
  'FIGHTS',
  'FINANCE',
  'GLOBAL',
  'MENTIONS',
  'MUSIC',
  'NAIROBI CHRONICLES',
  'POLITICS',
] as const;

export const mockMarkets: MarketCardData[] = [
  {
    id: '1',
    question: 'Will an African team make it to the world cup finals?',
    category: 'WORLD CUP',
    tag: 'SPORTS',
    daysLeft: 27,
    yesPercent: 29,
    noPercent: 71,
    yesOdds: 2.86,
    noOdds: 1.11,
    volume: 367,
    traders: 28,
    emoji: '🌍',
  },
  {
    id: '2',
    question: 'Will Lionel Messi be player of the tournament?',
    category: 'WORLD CUP',
    tag: 'SPORTS',
    daysLeft: 27,
    yesPercent: 45,
    noPercent: 55,
    yesOdds: 1.95,
    noOdds: 1.62,
    volume: 512,
    traders: 41,
    emoji: '⚽',
  },
  {
    id: '3',
    question: 'Will Kylian Mbappé score 5+ goals?',
    category: 'WORLD CUP',
    tag: 'SPORTS',
    daysLeft: 27,
    yesPercent: 38,
    noPercent: 62,
    yesOdds: 2.21,
    noOdds: 1.35,
    volume: 289,
    traders: 19,
    emoji: '🇫🇷',
  },
  {
    id: '4',
    question: 'Will a national team coach be fired during the tournament?',
    category: 'WORLD CUP',
    tag: 'SPORTS',
    daysLeft: 27,
    yesPercent: 52,
    noPercent: 48,
    yesOdds: 1.72,
    noOdds: 1.88,
    volume: 198,
    traders: 15,
    emoji: '📋',
  },
  {
    id: '5',
    question: 'Will a non-European team reach the semifinals?',
    category: 'WORLD CUP',
    tag: 'SPORTS',
    daysLeft: 27,
    yesPercent: 33,
    noPercent: 67,
    yesOdds: 2.45,
    noOdds: 1.28,
    volume: 421,
    traders: 32,
    emoji: '🏆',
  },
  {
    id: '6',
    question: 'Will England reach the quarterfinals?',
    category: 'WORLD CUP',
    tag: 'SPORTS',
    daysLeft: 27,
    yesPercent: 61,
    noPercent: 39,
    yesOdds: 1.48,
    noOdds: 2.15,
    volume: 634,
    traders: 55,
    emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  },
  {
    id: '7',
    question: 'Will France top their group?',
    category: 'WORLD CUP',
    tag: 'SPORTS',
    daysLeft: 15,
    yesPercent: 74,
    noPercent: 26,
    yesOdds: 1.18,
    noOdds: 2.29,
    volume: 890,
    traders: 67,
    emoji: '🇫🇷',
  },
  {
    id: '8',
    question: 'Will a Kenyan Governor post a photo watching the World Cup?',
    category: 'WORLD CUP',
    tag: 'POLITICS',
    daysLeft: 27,
    yesPercent: 82,
    noPercent: 18,
    yesOdds: 1.09,
    noOdds: 4.5,
    volume: 156,
    traders: 12,
    emoji: '🇰🇪',
  },
];
