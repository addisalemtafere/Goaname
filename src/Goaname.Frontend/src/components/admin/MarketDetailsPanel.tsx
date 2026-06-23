import { formatCategoryLabel } from '../../api/categories';
import type { ReactNode } from 'react';
import {
  formatMarketStatus,
  toCardPercent,
  type MarketBets,
  type MarketDto,
  type OddsSnapshot,
} from '../../api/markets';
import { AdminMoney, Alert, DetailRow, PanelSection, cn } from '../ui';

interface MarketDetailsPanelProps {
  market: MarketDto;
  odds: OddsSnapshot | null;
  bets: MarketBets | null;
  loading: boolean;
  error: string | null;
  currency?: string;
  embedded?: boolean;
}

export function MarketDetailsPanel({
  market,
  odds,
  bets,
  loading,
  error,
  currency = 'USD',
  embedded = false,
}: MarketDetailsPanelProps) {
  const content = (
    <>
      <dl className={cn(
        'mb-4 grid gap-x-3 gap-y-2',
        embedded ? 'grid-cols-[minmax(5rem,auto)_1fr]' : 'grid-cols-[120px_1fr]',
      )}
      >
        {!embedded && <DetailRow label="Title" value={market.title} />}
        {!embedded && <DetailRow label="Category" value={formatCategoryLabel(market.category)} />}
        <DetailRow label="Market ID" value={market.id} />
        <DetailRow label="Status" value={formatMarketStatus(market.status)} />
        {market.winningOutcome && (
          <DetailRow label="Winner" value={market.winningOutcome} />
        )}
        <DetailRow label="Visible" value={market.isVisible ? 'Yes' : 'No'} />
        <DetailRow
          label="Trading ends"
          value={new Date(market.tradingEndsAt).toLocaleString()}
        />
        <DetailRow label="Volume" value={<AdminMoney amount={market.totalVolume} currency={currency} />} />
        <DetailRow label="Traders" value={String(market.uniqueTraders)} />
      </dl>

      {loading && (
        <p className={cn('m-0 text-vantage-muted', embedded ? 'text-xs' : 'text-sm')}>Loading odds and bets…</p>
      )}

      {error && !loading && (
        <Alert>{error}</Alert>
      )}

      {!loading && !error && odds && (
        <div className={cn('mb-4 grid gap-1.5 text-vantage-muted', embedded ? 'text-xs' : 'gap-2 text-sm')}>
          <p className={cn('m-0 font-semibold text-vantage-fg', embedded && 'text-[10px] tracking-wide uppercase text-vantage-muted')}>
            Current odds
          </p>
          <p className="m-0">
            Yes: {toCardPercent(odds.yesProbability)}% ({odds.yesMultiplier.toFixed(2)}x)
          </p>
          <p className="m-0">
            No: {toCardPercent(odds.noProbability)}% ({odds.noMultiplier.toFixed(2)}x)
          </p>
        </div>
      )}

      {!loading && !error && bets && (
        <MarketBetsTable summary={bets.summary} bets={bets.bets} currency={currency} compact={embedded} />
      )}
    </>
  );

  if (embedded) {
    return content;
  }

  return (
    <PanelSection title="Market details" className="mt-3 border-t border-vantage-border pt-4">
      {content}
    </PanelSection>
  );
}

function MarketBetsTable({
  summary,
  bets,
  currency,
  compact = false,
}: {
  summary: MarketBets['summary'];
  bets: MarketBets['bets'];
  currency: string;
  compact?: boolean;
}) {
  return (
    <div className="grid gap-4 border-t border-vantage-border pt-4">
      <p className={cn('m-0 font-semibold text-vantage-fg', compact ? 'text-xs' : 'text-sm')}>Betting activity</p>

      <div className={cn('grid grid-cols-2 gap-2', compact ? 'sm:grid-cols-2' : 'gap-3 sm:grid-cols-4')}>
        <StatTile label="Total bets" value={String(summary.totalBets)} compact={compact} />
        <StatTile label="Unique traders" value={String(summary.uniqueTraders)} compact={compact} />
        <StatTile label="Total staked" value={<AdminMoney amount={summary.totalStaked} currency={currency} />} compact={compact} />
        <StatTile label="Paid out" value={<AdminMoney amount={summary.totalPaidOut} currency={currency} />} compact={compact} />
      </div>

      {bets.length === 0 ? (
        <p className={cn('m-0 text-vantage-muted', compact ? 'text-xs' : 'text-sm')}>No bets placed on this market yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-vantage-border">
          <table className={cn('w-full min-w-[480px] border-collapse text-left', compact ? 'text-xs' : 'text-sm')}>
            <thead className="bg-vantage-bg/60 text-[10px] font-bold tracking-wide text-vantage-muted uppercase">
              <tr>
                <th className="px-2 py-1.5">Trader</th>
                <th className="px-2 py-1.5">Side</th>
                <th className="px-2 py-1.5">Stake</th>
                <th className="px-2 py-1.5">Status</th>
                {!compact && <th className="px-2 py-1.5">Payout</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-vantage-border">
              {bets.map((bet) => (
                <tr key={bet.betSlipId} className="text-vantage-fg">
                  <td className="px-2 py-1.5 font-mono text-[10px]">{bet.userId.slice(0, 8)}</td>
                  <td
                    className={cn(
                      'px-2 py-1.5 font-bold',
                      bet.outcome === 'Yes' ? 'text-vantage-yes' : 'text-vantage-no',
                    )}
                  >
                    {bet.outcome}
                  </td>
                  <td className="px-2 py-1.5 tabular-nums">
                    <AdminMoney amount={bet.amount} currency={currency} className="text-xs" />
                  </td>
                  <td className={cn('px-2 py-1.5 text-xs font-semibold', betStatusClass(bet.status))}>
                    {bet.status}
                  </td>
                  {!compact && (
                    <td className="px-2 py-1.5 tabular-nums">
                      {bet.settlementAmount != null ? (
                        <AdminMoney amount={bet.settlementAmount} currency={currency} className="text-xs" />
                      ) : (
                        '-'
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatTile({ label, value, compact = false }: { label: string; value: ReactNode; compact?: boolean }) {
  return (
    <div className="rounded-md border border-vantage-border bg-vantage-bg/40 px-2 py-1.5">
      <p className="m-0 text-[9px] font-bold tracking-wider text-vantage-muted uppercase">{label}</p>
      <p className={cn('m-0 mt-0.5 font-semibold tabular-nums text-vantage-fg', compact ? 'text-xs' : 'text-sm')}>{value}</p>
    </div>
  );
}

function betStatusClass(status: string): string {
  if (status === 'Won') {
    return 'text-vantage-yes';
  }

  if (status === 'Lost') {
    return 'text-vantage-no';
  }

  return 'text-vantage-muted';
}
