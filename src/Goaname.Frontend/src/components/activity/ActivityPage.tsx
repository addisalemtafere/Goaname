import { useMemo, useState } from 'react';
import { formatTimeAgo, type ActivityFeedItem, type ActivityKind } from '../../api/activity';
import type { BetHistoryItem } from '../../api/bets';
import { formatMoney, normalizeCurrency } from '../../api/users';
import { useActivityData } from '../../hooks/useActivityData';
import { Alert, Button, Card, Chip, cn, EmptyState } from '../ui';

type ActivityFilter = 'all' | ActivityKind;

const FILTER_OPTIONS: { id: ActivityFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'buy_yes', label: 'Buy Yes' },
  { id: 'buy_no', label: 'Buy No' },
];

interface ActivityPageProps {
  isAuthenticated: boolean;
  refreshKey?: number;
  currency?: string;
  onSignIn?: () => void;
  onBrowseMarkets?: () => void;
}

export function ActivityPage({
  isAuthenticated,
  refreshKey = 0,
  currency = 'USD',
  onSignIn,
  onBrowseMarkets,
}: ActivityPageProps) {
  const [filter, setFilter] = useState<ActivityFilter>('all');
  const { feedItems, myBets, stats, loading, error } = useActivityData({
    refreshKey,
    isAuthenticated,
  });

  const normalizedCurrency = normalizeCurrency(currency);
  const items = useMemo(
    () => (filter === 'all' ? feedItems : feedItems.filter((item) => item.kind === filter)),
    [feedItems, filter],
  );

  return (
    <div className="grid w-full gap-4 sm:gap-5">
      {error && <Alert>{error}</Alert>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <StatCard label="24h volume" value={stats.volume24h} accent />
        <StatCard label="Bets today" value={stats.betsToday} />
        <StatCard label="Active markets" value={stats.activeMarkets} />
      </div>

      <MyBetsPanel
        isAuthenticated={isAuthenticated}
        loading={loading}
        bets={myBets}
        currency={normalizedCurrency}
        onSignIn={onSignIn}
        onBrowseMarkets={onBrowseMarkets}
      />

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
          Live activity
        </span>
      </div>

      {loading && (
        <Card className="rounded-2xl px-5 py-10 text-center text-sm text-vantage-muted">
          Loading activity…
        </Card>
      )}

      {!loading && items.length === 0 && (
        <EmptyState title="No activity yet" description="Place a bet to see live market activity here." />
      )}

      {!loading && items.length > 0 && (
        <Card className="game-data-panel w-full overflow-hidden rounded-2xl">
          <div className="hidden grid-cols-[88px_140px_120px_1fr_120px] gap-4 border-b border-vantage-border bg-vantage-bg/60 px-5 py-3 text-[11px] font-bold tracking-wider text-vantage-muted uppercase lg:grid">
            <span>Time</span>
            <span>Trader</span>
            <span>Action</span>
            <span>Market</span>
            <span className="text-right">Amount</span>
          </div>

          <ul className="m-0 list-none divide-y divide-vantage-border p-0">
            {items.map((item) => (
              <ActivityRow key={item.id} item={item} currency={normalizedCurrency} />
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function MyBetsPanel({
  isAuthenticated,
  loading,
  bets,
  currency,
  onSignIn,
  onBrowseMarkets,
}: {
  isAuthenticated: boolean;
  loading: boolean;
  bets: BetHistoryItem[];
  currency: 'USD' | 'ETB';
  onSignIn?: () => void;
  onBrowseMarkets?: () => void;
}) {
  return (
    <Card className="w-full overflow-hidden rounded-2xl">
      <div className="border-b border-vantage-border bg-vantage-bg/60 px-5 py-3">
        <h2 className="m-0 text-sm font-bold text-vantage-fg">My bets</h2>
      </div>

      {!isAuthenticated && (
        <div className="px-5 py-8 text-center">
          <p className="m-0 mb-4 text-sm text-vantage-muted">Sign in to view your bet history.</p>
          {onSignIn && (
            <Button variant="connect" onClick={onSignIn}>
              Sign in
            </Button>
          )}
        </div>
      )}

      {isAuthenticated && loading && (
        <p className="m-0 px-5 py-8 text-center text-sm text-vantage-muted">Loading your bets…</p>
      )}

      {isAuthenticated && !loading && bets.length === 0 && (
        <div className="px-5 py-8 text-center">
          <p className="m-0 mb-4 text-sm text-vantage-muted">You have not placed any bets yet.</p>
          {onBrowseMarkets && (
            <Button variant="secondary" onClick={onBrowseMarkets}>
              Browse markets
            </Button>
          )}
        </div>
      )}

      {isAuthenticated && !loading && bets.length > 0 && (
        <ul className="m-0 list-none divide-y divide-vantage-border p-0">
          {bets.map((bet) => (
            <MyBetRow key={bet.betSlipId} bet={bet} currency={currency} />
          ))}
        </ul>
      )}
    </Card>
  );
}

function MyBetRow({ bet, currency }: { bet: BetHistoryItem; currency: 'USD' | 'ETB' }) {
  const isYes = bet.outcome === 'Yes';
  const isWon = bet.status === 'Won';
  const isLost = bet.status === 'Lost';

  return (
    <li className="px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="m-0 mb-1 text-[10px] font-bold tracking-wider text-vantage-muted uppercase">{bet.category}</p>
          <p className="m-0 text-sm font-medium text-vantage-fg">{bet.marketTitle}</p>
          <p className="m-0 mt-1 text-xs text-vantage-muted">
            {formatTimeAgo(bet.placedAt)} · {bet.sharesReceived.toFixed(2)} shares @ {bet.oddsAtPlacement.toFixed(2)}x
          </p>
        </div>
        <div className="text-right">
          <span className={cn('text-xs font-bold', isYes ? 'text-vantage-yes' : 'text-vantage-no')}>
            {isYes ? 'Yes' : 'No'}
          </span>
          <p className="m-0 mt-1 text-sm font-bold text-vantage-fg">{formatMoney(bet.amount, currency)}</p>
          <p className={cn(
            'm-0 mt-1 text-xs font-bold',
            isWon && 'text-vantage-yes',
            isLost && 'text-vantage-no',
            !isWon && !isLost && 'text-vantage-muted',
          )}>
            {bet.status}
            {isWon && bet.settlementAmount != null && (
              <> · +{formatMoney(bet.settlementAmount, currency)}</>
            )}
          </p>
        </div>
      </div>
    </li>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <Card variant="elevated" className={cn('game-stat-card rounded-2xl p-4 sm:p-5', accent && 'game-stat-card--accent')}>
      <p className="m-0 text-[10px] font-bold tracking-wider text-vantage-muted uppercase sm:text-xs">{label}</p>
      <p className={cn('m-0 mt-1 text-xl font-extrabold sm:mt-2 sm:text-2xl', accent ? 'text-vantage-yes' : 'text-vantage-fg')}>
        {value}
      </p>
    </Card>
  );
}

function ActivityRow({ item, currency }: { item: ActivityFeedItem; currency: 'USD' | 'ETB' }) {
  const action = formatAction(item.kind);
  const timeAgo = formatTimeAgo(item.placedAt);

  return (
    <li className="px-4 py-4 transition hover:bg-vantage-elevated/30 sm:px-5">
      <div className="lg:hidden">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={cn('h-2 w-2 shrink-0 rounded-full', action.dotClass)} />
            <span className="text-xs text-vantage-muted">{timeAgo}</span>
            <ActionBadge kind={item.kind} label={action.shortLabel} />
          </div>
          {item.amount > 0 ? (
            <span className="text-sm font-bold text-vantage-yes">{formatMoney(item.amount, currency)}</span>
          ) : (
            <span className="text-sm font-medium text-vantage-accent">New</span>
          )}
        </div>
        <p className="m-0 mb-1 font-mono text-xs text-vantage-muted">{item.traderLabel}</p>
        <p className="m-0 mb-1 text-[10px] font-bold tracking-wider text-vantage-muted uppercase">{item.category}</p>
        <p className="m-0 text-sm font-medium text-vantage-fg">{item.marketTitle}</p>
        {item.shares != null && item.shares > 0 && (
          <p className="m-0 mt-1 text-xs text-vantage-muted">{item.shares.toFixed(0)} shares</p>
        )}
      </div>

      <div className="hidden grid-cols-[88px_140px_120px_1fr_120px] items-center gap-4 lg:grid">
        <div className="flex items-center gap-2">
          <span className={cn('h-2 w-2 shrink-0 rounded-full', action.dotClass)} />
          <span className="text-xs font-medium text-vantage-muted">{timeAgo}</span>
        </div>
        <span className="truncate font-mono text-sm text-vantage-fg">{item.traderLabel}</span>
        <div>
          <ActionBadge kind={item.kind} label={action.shortLabel} />
          {item.shares != null && item.shares > 0 && (
            <p className="m-0 mt-1 text-xs text-vantage-muted">{item.shares.toFixed(0)} shares</p>
          )}
        </div>
        <div className="min-w-0">
          <p className="m-0 mb-1 text-[11px] font-bold tracking-wider text-vantage-muted uppercase">{item.category}</p>
          <p className="m-0 line-clamp-2 text-sm font-medium text-vantage-fg">{item.marketTitle}</p>
        </div>
        <div className="text-right">
          {item.amount > 0 ? (
            <p className="m-0 text-sm font-bold text-vantage-yes">{formatMoney(item.amount, currency)}</p>
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
