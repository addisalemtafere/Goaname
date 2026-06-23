import { useMemo, useState } from 'react';
import { Card, Chip, cn } from '../ui';
import {
  activityStats,
  mockActivityFeed,
  type ActivityFeedItem,
  type ActivityFilter,
  type ActivityKind,
} from './mockActivityFeed';

const FILTER_OPTIONS: { id: ActivityFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'buy_yes', label: 'Buy Yes' },
  { id: 'buy_no', label: 'Buy No' },
  { id: 'sell', label: 'Sells' },
  { id: 'market_open', label: 'New' },
];

export function ActivityPage() {
  const [filter, setFilter] = useState<ActivityFilter>('all');

  const items = useMemo(
    () => (filter === 'all' ? mockActivityFeed : mockActivityFeed.filter((item) => item.kind === filter)),
    [filter],
  );

  return (
    <div className="grid w-full gap-4 sm:gap-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <StatCard label="24h volume" value={activityStats.volume24h} accent />
        <StatCard label="Bets today" value={activityStats.betsToday} />
        <StatCard label="Active markets" value={activityStats.activeMarkets} />
      </div>

      <div className="grid gap-3">
        <div className="-mx-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-2 px-1 pb-1">
            {FILTER_OPTIONS.map((option) => (
              <Chip
                key={option.id}
                label={option.label}
                active={filter === option.id}
                onClick={() => setFilter(option.id)}
              />
            ))}
          </div>
        </div>
        <span className="flex items-center gap-2 text-xs font-bold tracking-wide text-vantage-muted uppercase">
          <span className="relative flex h-2 w-2">
            <span className="vantage-pulse-ring absolute inline-flex h-full w-full rounded-full bg-vantage-live" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-vantage-live" />
          </span>
          Updating live
        </span>
      </div>

      <Card className="w-full overflow-hidden rounded-2xl">
        <div className="hidden grid-cols-[88px_140px_120px_1fr_120px] gap-4 border-b border-vantage-border bg-vantage-bg/60 px-5 py-3 text-[11px] font-bold tracking-wider text-vantage-muted uppercase lg:grid">
          <span>Time</span>
          <span>Trader</span>
          <span>Action</span>
          <span>Market</span>
          <span className="text-right">Amount</span>
        </div>

        {items.length === 0 ? (
          <p className="m-0 px-5 py-10 text-center text-sm text-vantage-muted">No activity for this filter.</p>
        ) : (
          <ul className="m-0 list-none divide-y divide-vantage-border p-0">
            {items.map((item) => (
              <ActivityRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <Card variant="elevated" className="rounded-2xl p-4 sm:p-5">
      <p className="m-0 text-[10px] font-bold tracking-wider text-vantage-muted uppercase sm:text-xs">{label}</p>
      <p className={cn('m-0 mt-1 text-xl font-extrabold sm:mt-2 sm:text-2xl', accent ? 'text-vantage-yes' : 'text-vantage-fg')}>
        {value}
      </p>
    </Card>
  );
}

function ActivityRow({ item }: { item: ActivityFeedItem }) {
  const action = formatAction(item.kind);

  return (
    <li className="px-4 py-4 transition hover:bg-vantage-elevated/30 sm:px-5">
      {/* Mobile card */}
      <div className="lg:hidden">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={cn('h-2 w-2 shrink-0 rounded-full', action.dotClass)} />
            <span className="text-xs text-vantage-muted">{item.timeAgo}</span>
            <ActionBadge kind={item.kind} label={action.shortLabel} />
          </div>
          {item.amount > 0 ? (
            <span className="text-sm font-bold text-vantage-yes">${item.amount.toLocaleString()}</span>
          ) : (
            <span className="text-sm font-medium text-vantage-accent">New</span>
          )}
        </div>
        <p className="m-0 mb-1 font-mono text-xs text-vantage-muted">{item.wallet}</p>
        <p className="m-0 mb-1 text-[10px] font-bold tracking-wider text-vantage-muted uppercase">{item.category}</p>
        <p className="m-0 text-sm font-medium text-vantage-fg">{item.market}</p>
        {item.shares && <p className="m-0 mt-1 text-xs text-vantage-muted">{item.shares} shares</p>}
      </div>

      {/* Desktop row */}
      <div className="hidden grid-cols-[88px_140px_120px_1fr_120px] items-center gap-4 lg:grid">
        <div className="flex items-center gap-2">
          <span className={cn('h-2 w-2 shrink-0 rounded-full', action.dotClass)} />
          <span className="text-xs font-medium text-vantage-muted">{item.timeAgo}</span>
        </div>
        <span className="truncate font-mono text-sm text-vantage-fg">{item.wallet}</span>
        <div>
          <ActionBadge kind={item.kind} label={action.shortLabel} />
          {item.shares && <p className="m-0 mt-1 text-xs text-vantage-muted">{item.shares} shares</p>}
        </div>
        <div className="min-w-0">
          <p className="m-0 mb-1 text-[11px] font-bold tracking-wider text-vantage-muted uppercase">{item.category}</p>
          <p className="m-0 line-clamp-2 text-sm font-medium text-vantage-fg">{item.market}</p>
        </div>
        <div className="text-right">
          {item.amount > 0 ? (
            <p className="m-0 text-sm font-bold text-vantage-yes">${item.amount.toLocaleString()}</p>
          ) : (
            <p className="m-0 text-sm font-medium text-vantage-accent">New</p>
          )}
        </div>
      </div>
    </li>
  );
}

function ActionBadge({ kind, label }: { kind: ActivityKind; label: string }) {
  const className: Record<ActivityKind, string> = {
    buy_yes: 'bg-vantage-yes/15 text-vantage-yes',
    buy_no: 'bg-vantage-no/15 text-vantage-no',
    sell: 'bg-vantage-elevated text-vantage-muted border border-vantage-border',
    market_open: 'bg-vantage-accent/15 text-vantage-accent',
  };

  return (
    <span className={cn('inline-block rounded-full px-2.5 py-0.5 text-xs font-bold', className[kind])}>
      {label}
    </span>
  );
}

function formatAction(kind: ActivityKind): { shortLabel: string; dotClass: string } {
  const map: Record<ActivityKind, { shortLabel: string; dotClass: string }> = {
    buy_yes: { shortLabel: 'Buy Yes', dotClass: 'bg-vantage-yes' },
    buy_no: { shortLabel: 'Buy No', dotClass: 'bg-vantage-no' },
    sell: { shortLabel: 'Sell', dotClass: 'bg-vantage-muted' },
    market_open: { shortLabel: 'Opened', dotClass: 'bg-vantage-accent' },
  };

  return map[kind];
}
