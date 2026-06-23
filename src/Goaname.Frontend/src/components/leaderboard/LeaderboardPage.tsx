import { useEffect, useState } from 'react';
import {
  formatPnl,
  formatTraderId,
  formatVolume,
  getLeaderboard,
  type Leaderboard,
  type LeaderboardEntry,
} from '../../api/leaderboard';
import { Alert, Badge, Card, cn, EmptyState } from '../ui';

export function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await getLeaderboard();
        if (!cancelled) {
          setLeaderboard(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load leaderboard.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} variant="elevated" className="h-24 animate-pulse rounded-2xl bg-vantage-surface/60" />
          ))}
        </div>
        <Card className="h-80 animate-pulse rounded-2xl bg-vantage-surface/60" />
      </div>
    );
  }

  if (error) {
    return <Alert>{error}</Alert>;
  }

  if (!leaderboard || leaderboard.entries.length === 0) {
    return (
      <EmptyState
        title="No traders yet"
        description="Place bets to appear on the leaderboard once trading activity starts."
      />
    );
  }

  const { stats, entries } = leaderboard;

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <StatCard label="Active traders" value={stats.activeTraders.toLocaleString()} />
        <StatCard label="Weekly volume" value={formatVolume(stats.weeklyVolume)} accent />
        <StatCard label="Top win rate" value={`${stats.topWinRate}%`} />
      </div>

      <Card className="overflow-hidden rounded-2xl">
        <div className="hidden grid-cols-[56px_1fr_120px_100px_120px_80px] gap-4 border-b border-vantage-border px-5 py-3 text-[11px] font-bold tracking-wider text-vantage-muted uppercase lg:grid">
          <span>Rank</span>
          <span>Trader</span>
          <span className="text-right">PnL</span>
          <span className="text-right">Win %</span>
          <span className="text-right">Volume</span>
          <span className="text-right">Trades</span>
        </div>

        <ul className="m-0 list-none divide-y divide-vantage-border p-0">
          {entries.map((entry) => (
            <LeaderboardRow key={entry.userId} entry={entry} />
          ))}
        </ul>
      </Card>
    </div>
  );
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const pnlClass = entry.pnl >= 0 ? 'text-vantage-yes' : 'text-vantage-no';

  return (
    <li
      className={cn(
        'px-4 py-4 sm:px-5',
        entry.rank <= 3 && 'bg-vantage-accent/5',
      )}
    >
      <div className="lg:hidden">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <RankBadge rank={entry.rank} />
            <div className="min-w-0">
              <p className="m-0 truncate font-bold text-vantage-fg">{entry.displayName}</p>
              <p className="m-0 truncate font-mono text-xs text-vantage-muted">{formatTraderId(entry.userId)}</p>
            </div>
          </div>
          <p className={cn('m-0 shrink-0 text-sm font-bold', pnlClass)}>{formatPnl(entry.pnl)}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <MobileStat label="Win %" value={`${entry.winRate}%`} />
          <MobileStat label="Volume" value={formatVolume(entry.volume)} />
          <MobileStat label="Trades" value={String(entry.trades)} />
        </div>
      </div>

      <div className="hidden grid-cols-[56px_1fr_120px_100px_120px_80px] items-center gap-4 lg:grid">
        <RankBadge rank={entry.rank} />
        <div className="min-w-0">
          <p className="m-0 truncate font-bold text-vantage-fg">{entry.displayName}</p>
          <p className="m-0 truncate font-mono text-xs text-vantage-muted">{formatTraderId(entry.userId)}</p>
        </div>
        <p className={cn('m-0 text-right text-base font-bold', pnlClass)}>{formatPnl(entry.pnl)}</p>
        <p className="m-0 text-right text-sm text-vantage-fg">{entry.winRate}%</p>
        <p className="m-0 text-right text-sm text-vantage-muted">{formatVolume(entry.volume)}</p>
        <p className="m-0 text-right text-sm text-vantage-muted">{entry.trades}</p>
      </div>
    </li>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <Card variant="elevated" className="rounded-2xl p-4 sm:p-5">
      <p className="m-0 text-[10px] font-bold tracking-wider text-vantage-muted uppercase sm:text-xs">{label}</p>
      <p className={cn('m-0 mt-1 text-xl font-extrabold sm:mt-2 sm:text-2xl', accent ? 'text-vantage-accent' : 'text-vantage-fg')}>
        {value}
      </p>
    </Card>
  );
}

function MobileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-vantage-bg/80 px-2 py-2">
      <p className="m-0 text-[10px] font-bold tracking-wider text-vantage-muted uppercase">{label}</p>
      <p className="m-0 mt-0.5 text-sm font-bold text-vantage-fg">{value}</p>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return <Badge variant="live">#{rank}</Badge>;
  }
  if (rank <= 3) {
    return <Badge variant="accent">#{rank}</Badge>;
  }
  return <span className="text-sm font-bold text-vantage-muted">#{rank}</span>;
}
