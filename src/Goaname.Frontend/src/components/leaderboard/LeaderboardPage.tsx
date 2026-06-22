import { Badge, Card, cn } from '../ui';
import { mockLeaderboard } from './mockLeaderboard';

export function LeaderboardPage() {
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <StatCard label="Active traders" value="1,492" />
        <StatCard label="Weekly volume" value="$4.2M" accent />
        <StatCard label="Top win rate" value="68%" />
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
          {mockLeaderboard.map((entry) => (
            <li
              key={entry.wallet}
              className={cn(
                'px-4 py-4 sm:px-5',
                entry.rank <= 3 && 'bg-vantage-accent/5',
              )}
            >
              {/* Mobile card */}
              <div className="lg:hidden">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <RankBadge rank={entry.rank} />
                    <div className="min-w-0">
                      <p className="m-0 truncate font-bold text-vantage-fg">{entry.displayName}</p>
                      <p className="m-0 truncate font-mono text-xs text-vantage-muted">{entry.wallet}</p>
                    </div>
                  </div>
                  <p className="m-0 shrink-0 text-sm font-bold text-vantage-yes">+${entry.pnl.toLocaleString()}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <MobileStat label="Win %" value={`${entry.winRate}%`} />
                  <MobileStat label="Volume" value={`$${(entry.volume / 1000).toFixed(0)}K`} />
                  <MobileStat label="Trades" value={String(entry.trades)} />
                </div>
              </div>

              {/* Desktop row */}
              <div className="hidden grid-cols-[56px_1fr_120px_100px_120px_80px] items-center gap-4 lg:grid">
                <RankBadge rank={entry.rank} />
                <div className="min-w-0">
                  <p className="m-0 truncate font-bold text-vantage-fg">{entry.displayName}</p>
                  <p className="m-0 truncate font-mono text-xs text-vantage-muted">{entry.wallet}</p>
                </div>
                <p className="m-0 text-right text-base font-bold text-vantage-yes">+${entry.pnl.toLocaleString()}</p>
                <p className="m-0 text-right text-sm text-vantage-fg">{entry.winRate}%</p>
                <p className="m-0 text-right text-sm text-vantage-muted">${entry.volume.toLocaleString()}</p>
                <p className="m-0 text-right text-sm text-vantage-muted">{entry.trades}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
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
