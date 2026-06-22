import { useEffect, useState } from 'react';
import { formatVolume, listActivity, type ActivityFeedItem } from '../api/activity';
import { listMyBets, type BetHistoryItem } from '../api/bets';

export interface ActivityViewStats {
  volume24h: string;
  betsToday: string;
  activeMarkets: string;
}

interface UseActivityDataOptions {
  refreshKey?: number;
  isAuthenticated?: boolean;
  feedLimit?: number;
  betsLimit?: number;
}

interface UseActivityDataResult {
  feedItems: ActivityFeedItem[];
  myBets: BetHistoryItem[];
  stats: ActivityViewStats;
  loading: boolean;
  error: string | null;
}

const emptyStats = (): ActivityViewStats => ({
  volume24h: formatVolume(0),
  betsToday: '0',
  activeMarkets: '0',
});

export function useActivityData({
  refreshKey = 0,
  isAuthenticated = false,
  feedLimit = 50,
  betsLimit = 50,
}: UseActivityDataOptions = {}): UseActivityDataResult {
  const [feedItems, setFeedItems] = useState<ActivityFeedItem[]>([]);
  const [myBets, setMyBets] = useState<BetHistoryItem[]>([]);
  const [stats, setStats] = useState<ActivityViewStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const feedPromise = listActivity(feedLimit);
        const betsPromise = isAuthenticated ? listMyBets(betsLimit) : Promise.resolve([] as BetHistoryItem[]);
        const [feed, bets] = await Promise.all([feedPromise, betsPromise]);

        if (cancelled) {
          return;
        }

        setFeedItems(feed.items);
        setStats({
          volume24h: formatVolume(feed.stats.volume24h),
          betsToday: feed.stats.betsToday.toLocaleString(),
          activeMarkets: feed.stats.activeMarkets.toLocaleString(),
        });
        setMyBets(bets);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load activity');
          setFeedItems([]);
          setMyBets([]);
          setStats(emptyStats());
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshKey, isAuthenticated, feedLimit, betsLimit]);

  return { feedItems, myBets, stats, loading, error };
}
