import { useState } from 'react';
import { betSideToOutcome, placeBet, type PlaceBetResponse } from '../../api/bets';
import { formatCategoryLabel } from '../../api/categories';
import { daysUntil, toCardPercent, type MarketDto } from '../../api/markets';
import { formatMoney, type Wallet } from '../../api/users';
import { Alert, Button, Card, cn, Field, IconButton, Input } from '../ui';

export type BetSide = 'yes' | 'no';

interface MarketCardProps {
  market: MarketDto;
  expandedSide: BetSide | null;
  onSelectSide: (side: BetSide | null) => void;
  isAuthenticated: boolean;
  onSignIn: () => void;
  wallet: Wallet | null;
  onBetPlaced: (marketId: string, response: PlaceBetResponse) => void;
}

export function MarketCard({
  market,
  expandedSide,
  onSelectSide,
  isAuthenticated,
  onSignIn,
  wallet,
  onBetPlaced,
}: MarketCardProps) {
  const yesPercent = toCardPercent(market.yesProbability);
  const noPercent = toCardPercent(market.noProbability);
  const yesPrice = market.yesProbability;
  const noPrice = market.noProbability;
  const daysLeft = daysUntil(market.tradingEndsAt);
  const expiryLabel = formatExpiry(market.tradingEndsAt, daysLeft);
  const isExpanded = expandedSide !== null;

  function handleSideClick(side: BetSide) {
    if (!isAuthenticated) {
      onSignIn();
      return;
    }
    onSelectSide(expandedSide === side ? null : side);
  }

  return (
    <Card
      as="article"
      className={cn(
        'flex flex-col overflow-hidden rounded-2xl transition',
        isExpanded ? 'ring-1 ring-vantage-accent/50' : 'hover:border-vantage-border/80',
      )}
    >
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold tracking-wider text-vantage-muted uppercase">
            {formatCategoryLabel(market.category)}
          </span>
          <span className="text-[11px] font-bold tracking-wide text-vantage-muted uppercase">
            {expiryLabel}
          </span>
        </div>

        <h2 className="mb-5 line-clamp-3 flex-1 text-[15px] leading-snug font-bold text-vantage-fg">
          {market.title}
        </h2>

        <ProbabilitySection
          yesPercent={yesPercent}
          noPercent={noPercent}
          yesPrice={yesPrice}
          noPrice={noPrice}
        />

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button
            variant="buyYes"
            onClick={() => handleSideClick('yes')}
            className={expandedSide === 'yes' ? 'bg-vantage-yes text-black' : undefined}
          >
            Buy Yes
          </Button>
          <Button
            variant="buyNo"
            onClick={() => handleSideClick('no')}
            className={expandedSide === 'no' ? 'bg-vantage-no text-white' : undefined}
          >
            Buy No
          </Button>
        </div>

        <div className="mt-4 flex justify-between text-[11px] font-medium tracking-wide text-vantage-muted uppercase">
          <span>Vol: ${formatVolume(market.totalVolume)}</span>
          <span>{market.uniqueTraders} Holders</span>
        </div>
      </div>

      {isExpanded && expandedSide && (
        <BetPanel
          market={market}
          side={expandedSide}
          wallet={wallet}
          onClose={() => onSelectSide(null)}
          onBetPlaced={onBetPlaced}
        />
      )}
    </Card>
  );
}

function ProbabilitySection({
  yesPercent,
  noPercent,
  yesPrice,
  noPrice,
}: {
  yesPercent: number;
  noPercent: number;
  yesPrice: number;
  noPrice: number;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-xs font-bold">
        <span className="text-vantage-yes">YES {yesPercent}%</span>
        <span className="text-vantage-no">NO {noPercent}%</span>
      </div>
      <div className="mb-3 flex h-1.5 overflow-hidden rounded-full bg-vantage-no/30">
        <div
          className="vantage-bar-yes h-full rounded-full bg-vantage-yes"
          style={{ width: `${yesPercent}%` }}
        />
      </div>
      <div className="flex justify-between">
        <div>
          <p className="m-0 text-[10px] font-bold tracking-wider text-vantage-muted uppercase">Yes</p>
          <p className="m-0 text-xl font-bold text-vantage-fg">${yesPrice.toFixed(2)}</p>
        </div>
        <div className="text-right">
          <p className="m-0 text-[10px] font-bold tracking-wider text-vantage-muted uppercase">No</p>
          <p className="m-0 text-xl font-bold text-vantage-fg">${noPrice.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

function BetPanel({
  market,
  side,
  wallet,
  onClose,
  onBetPlaced,
}: {
  market: MarketDto;
  side: BetSide;
  wallet: Wallet | null;
  onClose: () => void;
  onBetPlaced: (marketId: string, response: PlaceBetResponse) => void;
}) {
  const [amount, setAmount] = useState('10');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isYes = side === 'yes';
  const multiplier = isYes ? market.yesMultiplier : market.noMultiplier;
  const parsedAmount = parseAmount(amount);
  const estimatedPayout = parsedAmount !== null ? parsedAmount * multiplier : null;
  const currency = wallet?.currency ?? 'USD';

  async function handleConfirm() {
    if (parsedAmount === null || parsedAmount <= 0) {
      setError('Enter a valid bet amount.');
      return;
    }

    if (wallet && parsedAmount > wallet.balance) {
      setError('Insufficient wallet balance.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await placeBet(market.id, {
        outcome: betSideToOutcome(side),
        amount: parsedAmount,
      });

      onBetPlaced(market.id, response);
      setSuccess(
        `Bet placed · ${response.sharesReceived.toFixed(2)} shares @ ${response.oddsAtPlacement.toFixed(2)}x`,
      );

      window.setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place bet');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="border-t border-vantage-border bg-vantage-bg p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className={`m-0 text-sm font-bold ${isYes ? 'text-vantage-yes' : 'text-vantage-no'}`}>
          Buy {isYes ? 'Yes' : 'No'} · {multiplier.toFixed(2)}x
        </p>
        <IconButton label="Close bet panel" size="sm" onClick={onClose} className="border-none bg-transparent" />
      </div>

      {wallet && (
        <p className="mb-3 text-xs text-vantage-muted">
          Balance:{' '}
          <span className="font-semibold text-vantage-fg">{formatMoney(wallet.balance, currency)}</span>
        </p>
      )}

      <Field label="Bet amount">
        <Input
          type="number"
          min={0.01}
          step={0.01}
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={submitting}
          placeholder="10.00"
        />
      </Field>

      <Card variant="elevated" className="my-4 flex justify-between rounded-xl px-4 py-3">
        <span className="text-sm text-vantage-muted">Est. max payout</span>
        <span className="text-lg font-bold text-vantage-fg">
          {estimatedPayout !== null ? formatMoney(estimatedPayout, currency) : '—'}
        </span>
      </Card>

      {error && (
        <Alert className="mb-3">{error}</Alert>
      )}

      {success && (
        <Alert variant="accent" className="mb-3">{success}</Alert>
      )}

      <Button
        variant={isYes ? 'buyYes' : 'buyNo'}
        disabled={submitting || parsedAmount === null || parsedAmount <= 0}
        onClick={() => void handleConfirm()}
      >
        {submitting
          ? 'Placing bet…'
          : `Confirm · ${parsedAmount !== null ? formatMoney(parsedAmount, currency) : '—'}`}
      </Button>
    </div>
  );
}

function parseAmount(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatExpiry(tradingEndsAt: string, daysLeft: number): string {
  if (daysLeft <= 7) {
    return 'Live Now';
  }

  const date = new Date(tradingEndsAt);
  const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  return `Exp. ${month} ${day}, ${year}`;
}

function formatVolume(volume: number): string {
  if (volume >= 1_000_000) {
    return `${(volume / 1_000_000).toFixed(1)}M`;
  }
  if (volume >= 1_000) {
    return `${(volume / 1_000).toFixed(1)}K`;
  }
  return volume.toFixed(0);
}
