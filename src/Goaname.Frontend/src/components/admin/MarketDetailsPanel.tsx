import { formatCategoryLabel } from '../../api/categories';
import {
  formatMarketStatus,
  toCardPercent,
  type MarketBets,
  type MarketDto,
  type OddsSnapshot,
} from '../../api/markets';
import { formatMoney } from '../../api/users';
import { Alert, DetailRow, PanelSection, cn } from '../ui';

interface MarketDetailsPanelProps {
  market: MarketDto;
  odds: OddsSnapshot | null;
  bets: MarketBets | null;
  loading: boolean;
  error: string | null;
  currency?: string;
}

export function MarketDetailsPanel({
  market,
  odds,
  bets,
  loading,
  error,
  currency = 'USD',
}: MarketDetailsPanelProps) {
  return (
    <PanelSection title="Market details" className="mt-3 border-t border-vantage-border pt-4">
      <dl className="mb-4 grid grid-cols-[120px_1fr] gap-x-4 gap-y-2">
        <DetailRow label="Title" value={market.title} />
        <DetailRow label="Market ID" value={market.id} />
        <DetailRow label="Category" value={formatCategoryLabel(market.category)} />
        <DetailRow label="Status" value={formatMarketStatus(market.status)} />
        {market.winningOutcome && (
          <DetailRow label="Winner" value={market.winningOutcome} />
        )}
        <DetailRow label="Visible" value={market.isVisible ? 'Yes' : 'No'} />
        <DetailRow
          label="Trading ends"
          value={new Date(market.tradingEndsAt).toLocaleString()}
        />
        <DetailRow label="Volume" value={formatMoney(market.totalVolume, currency)} />
        <DetailRow label="Traders" value={String(market.uniqueTraders)} />
      </dl>

      {loading && (
        <p className="m-0 text-sm text-vantage-muted">Loading odds and bets…</p>
      )}

      {error && !loading && (
        <Alert>{error}</Alert>
      )}

      {!loading && !error && odds && (
        <div className="mb-4 grid gap-2 text-sm text-vantage-muted">
          <p className="m-0 font-semibold text-vantage-fg">Current odds</p>
          <p className="m-0">
            Yes: {toCardPercent(odds.yesProbability)}% ({odds.yesMultiplier.toFixed(2)}x)
          </p>
          <p className="m-0">
            No: {toCardPercent(odds.noProbability)}% ({odds.noMultiplier.toFixed(2)}x)
          </p>
        </div>
      )}

      {!loading && !error && bets && (
        <MarketBetsTable summary={bets.summary} bets={bets.bets} currency={currency} />
      )}
    </PanelSection>
  );
}

function MarketBetsTable({
  summary,
  bets,
  currency,
}: {
  summary: MarketBets['summary'];
  bets: MarketBets['bets'];
  currency: string;
}) {
  return (
    <div className="grid gap-4 border-t border-vantage-border pt-4">
      <p className="m-0 text-sm font-semibold text-vantage-fg">Betting activity</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Total bets" value={String(summary.totalBets)} />
        <StatTile label="Unique traders" value={String(summary.uniqueTraders)} />
        <StatTile label="Total staked" value={formatMoney(summary.totalStaked, currency)} />
        <StatTile label="Paid out" value={formatMoney(summary.totalPaidOut, currency)} />
        <StatTile
          label="Yes bets"
          value={`${summary.yesBets} · ${formatMoney(summary.yesStaked, currency)}`}
        />
        <StatTile
          label="No bets"
          value={`${summary.noBets} · ${formatMoney(summary.noStaked, currency)}`}
        />
        <StatTile label="Pending" value={String(summary.pendingBets)} />
        <StatTile label="Won / Lost" value={`${summary.wonBets} / ${summary.lostBets}`} />
      </div>

      {bets.length === 0 ? (
        <p className="m-0 text-sm text-vantage-muted">No bets placed on this market yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-vantage-border">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead className="bg-vantage-bg/60 text-xs font-bold tracking-wide text-vantage-muted uppercase">
              <tr>
                <th className="px-3 py-2">Trader</th>
                <th className="px-3 py-2">Side</th>
                <th className="px-3 py-2">Stake</th>
                <th className="px-3 py-2">Shares</th>
                <th className="px-3 py-2">Odds</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Payout</th>
                <th className="px-3 py-2">Placed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vantage-border">
              {bets.map((bet) => (
                <tr key={bet.betSlipId} className="text-vantage-fg">
                  <td className="px-3 py-2 font-mono text-xs">{bet.userId.slice(0, 8)}</td>
                  <td
                    className={cn(
                      'px-3 py-2 font-bold',
                      bet.outcome === 'Yes' ? 'text-vantage-yes' : 'text-vantage-no',
                    )}
                  >
                    {bet.outcome}
                  </td>
                  <td className="px-3 py-2">{formatMoney(bet.amount, currency)}</td>
                  <td className="px-3 py-2">{bet.sharesReceived.toFixed(2)}</td>
                  <td className="px-3 py-2">{bet.oddsAtPlacement.toFixed(2)}x</td>
                  <td className={cn('px-3 py-2 font-semibold', betStatusClass(bet.status))}>
                    {bet.status}
                  </td>
                  <td className="px-3 py-2">
                    {bet.settlementAmount != null
                      ? formatMoney(bet.settlementAmount, currency)
                      : '—'}
                  </td>
                  <td className="px-3 py-2 text-xs text-vantage-muted">
                    {new Date(bet.placedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-vantage-border bg-vantage-bg/40 px-3 py-2">
      <p className="m-0 text-[10px] font-bold tracking-wide text-vantage-muted uppercase">{label}</p>
      <p className="m-0 mt-1 text-sm font-bold text-vantage-fg">{value}</p>
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
