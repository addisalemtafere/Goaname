import { Badge, Card, cn } from '../ui';
import { mockLeaderboard } from './mockLeaderboard';

export function LeaderboardPage() {
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Active traders" value="1,492" />
        <StatCard label="Weekly volume" value="$4.2M" accent />
        <StatCard label="Top win rate" value="68%" />
      </div>

      <Card className="overflow-hidden rounded-2xl">
        <div className="hidden grid-cols-[56px_1fr_120px_100px_120px_80px] gap-4 border-b border-vantage-border px-5 py-3 text-[11px] font-bold tracking-wider text-vantage-muted uppercase md:grid">
          <span>Rank</span>
          <span>Trader</span>
          <span className="text-right">PnL</span>
          <span className="text-right">Win %</span>
          <span className="text-right">Volume</span>
          <span className="text-right">Trades</span>
        </div>

        <ul className="m-0 list-none divide-y divide-vantage-border p-0">
          {mockLeaderboard.map((entry) => (
            <li
              key={entry.wallet}
              className={cn(
                'grid grid-cols-1 gap-3 px-5 py-4 md:grid-cols-[56px_1fr_120px_100px_120px_80px] md:items-center md:gap-4',
                entry.rank <= 3 && 'bg-vantage-accent/5',
              )}
            >
              <div className="flex items-center gap-3 md:block">
                <RankBadge rank={entry.rank} />
              </div>

              <div className="min-w-0">
                <p className="m-0 truncate font-bold text-vantage-fg">{entry.displayName}</p>
                <p className="m-0 truncate font-mono text-xs text-vantage-muted">{entry.wallet}</p>
              </div>

              <p className="m-0 text-right text-sm font-bold text-vantage-yes md:text-base">
                +${entry.pnl.toLocaleString()}
              </p>
              <p className="m-0 text-right text-sm text-vantage-fg">{entry.winRate}%</p>
              <p className="m-0 text-right text-sm text-vantage-muted">${entry.volume.toLocaleString()}</p>
              <p className="m-0 text-right text-sm text-vantage-muted">{entry.trades}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <Card variant="elevated" className="rounded-2xl p-5">
      <p className="m-0 text-xs font-bold tracking-wider text-vantage-muted uppercase">{label}</p>
      <p className={cn('m-0 mt-2 text-2xl font-extrabold', accent ? 'text-vantage-accent' : 'text-vantage-fg')}>
        {value}
      </p>
    </Card>
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
