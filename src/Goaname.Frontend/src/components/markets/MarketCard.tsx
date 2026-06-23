import { useState } from 'react';
import { betSideToOutcome, placeBet, type PlaceBetResponse } from '../../api/bets';
import { formatCategoryLabel } from '../../api/categories';
import { daysUntil, isBettingOpen, isSettledMarket, toCardPercent, type MarketDto } from '../../api/markets';
import { formatMoney, type Wallet } from '../../api/users';
import { Alert, Button, Card, cn, Field, IconButton, Input } from '../ui';

export type BetSide = 'yes' | 'no';

interface MarketCardProps {
  market: MarketDto;
  expandedSide: BetSide | null;
  onSelectSide: (side: BetSide | null) => void;
  isAuthenticated: boolean;
  onSignIn: () => void;
  onAddFunds?: () => void;
  wallet: Wallet | null;
  onBetPlaced: (marketId: string, response: PlaceBetResponse) => void;
}

export function MarketCard({
  market,
  expandedSide,
  onSelectSide,
  isAuthenticated,
  onSignIn,
  onAddFunds,
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
  const bettingOpen = isBettingOpen(market);
  const settled = isSettledMarket(market);
  const categoryStyle = getCategoryStyle(market.category);

  function handleSideClick(side: BetSide) {
    if (!bettingOpen) {
      return;
    }
    if (!isAuthenticated) {
      onSignIn();
      return;
    }
    onSelectSide(expandedSide === side ? null : side);
  }

  return (
    <Card
      as="article"
      variant="surface"
      className={cn(
        'game-card flex flex-col overflow-hidden rounded-2xl',
        isExpanded && 'game-card--active ring-1 ring-vantage-accent/40',
      )}
    >
      <div className="relative z-[1] flex flex-1 flex-col p-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          <span
            className={cn(
              'game-category rounded border px-2 py-0.5 text-[10px] font-bold uppercase',
              categoryStyle,
            )}
          >
            {formatCategoryLabel(market.category)}
          </span>
          <span
            className={cn(
              'text-[10px] font-bold tracking-[0.12em] uppercase',
              daysLeft <= 7 ? 'text-vantage-live' : 'text-vantage-muted',
            )}
          >
            {expiryLabel}
          </span>
        </div>

        <h2 className="mb-5 line-clamp-3 flex-1 text-[15px] leading-snug font-bold text-vantage-fg">
          {market.title}
        </h2>

        {settled && market.winningOutcome && (
          <p className="mb-4 rounded-lg border border-vantage-accent/30 bg-vantage-accent/10 px-3 py-2 text-xs font-bold text-vantage-accent">
            Settled · {market.winningOutcome} won
          </p>
        )}

        <ProbabilitySection
          yesPercent={yesPercent}
          noPercent={noPercent}
          yesPrice={yesPrice}
          noPrice={noPrice}
        />

        {bettingOpen ? (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button
              variant="buyYes"
              onClick={() => handleSideClick('yes')}
              className={expandedSide === 'yes' ? 'bg-vantage-yes text-black shadow-[0_0_24px_rgba(0,230,118,0.5)]' : undefined}
            >
              Buy Yes
            </Button>
            <Button
              variant="buyNo"
              onClick={() => handleSideClick('no')}
              className={expandedSide === 'no' ? 'bg-vantage-no text-white shadow-[0_0_24px_rgba(255,82,82,0.45)]' : undefined}
            >
              Buy No
            </Button>
          </div>
        ) : (
          <p className="mt-4 text-center text-xs font-semibold tracking-[0.14em] text-vantage-muted uppercase">
            {settled ? 'Trading closed · Settled' : 'Trading closed'}
          </p>
        )}

        <div className="mt-4 flex justify-between border-t border-vantage-border/50 pt-3 text-[10px] font-bold tracking-[0.1em] text-vantage-muted uppercase">
          <span>Vol: ${formatVolume(market.totalVolume)}</span>
          <span>{market.uniqueTraders} Holders</span>
        </div>
      </div>

      {isExpanded && expandedSide && (
        <BetPanel
          market={market}
          side={expandedSide}
          wallet={wallet}
          onAddFunds={onAddFunds}
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
      <div className="mb-2 flex justify-between font-[family-name:var(--font-display)] text-xs font-bold tracking-wide">
        <span className="text-vantage-yes drop-shadow-[0_0_8px_rgba(0,230,118,0.5)]">YES {yesPercent}%</span>
        <span className="text-vantage-no drop-shadow-[0_0_8px_rgba(255,82,82,0.45)]">NO {noPercent}%</span>
      </div>
      <div className="game-odds-track mb-3 flex h-2 overflow-hidden rounded-full">
        <div
          className="game-odds-yes vantage-bar-yes h-full rounded-full"
          style={{ width: `${yesPercent}%` }}
        />
      </div>
      <div className="flex justify-between">
        <div>
          <p className="m-0 text-[10px] font-bold tracking-[0.12em] text-vantage-muted uppercase">Yes</p>
          <p className="game-price m-0 text-2xl font-bold text-vantage-fg">${yesPrice.toFixed(2)}</p>
        </div>
        <div className="text-right">
          <p className="m-0 text-[10px] font-bold tracking-[0.12em] text-vantage-muted uppercase">No</p>
          <p className="game-price m-0 text-2xl font-bold text-vantage-fg">${noPrice.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

function BetPanel({
  market,
  side,
  wallet,
  onAddFunds,
  onClose,
  onBetPlaced,
}: {
  market: MarketDto;
  side: BetSide;
  wallet: Wallet | null;
  onAddFunds?: () => void;
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
  const insufficientBalance =
    wallet !== null && parsedAmount !== null && parsedAmount > 0 && parsedAmount > wallet.balance;

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
    <div className="relative z-[1] border-t border-vantage-accent/20 bg-vantage-bg/90 p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <p className={`m-0 font-[family-name:var(--font-display)] text-sm font-bold tracking-wide ${isYes ? 'text-vantage-yes' : 'text-vantage-no'}`}>
          Buy {isYes ? 'Yes' : 'No'} · {multiplier.toFixed(2)}x
        </p>
        <IconButton label="Close bet panel" size="sm" onClick={onClose} className="border-none bg-transparent" />
      </div>

      {wallet && (
        <p className="mb-3 text-xs text-vantage-muted">
          Balance:{' '}
          <span className="font-semibold text-vantage-yes">{formatMoney(wallet.balance, currency)}</span>
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
          className="game-search"
        />
      </Field>

      <Card variant="elevated" className="my-4 flex justify-between rounded-xl border-vantage-border/60 px-4 py-3">
        <span className="text-sm text-vantage-muted">Est. max payout</span>
        <span className="game-price text-lg font-bold text-vantage-fg">
          {estimatedPayout !== null ? formatMoney(estimatedPayout, currency) : '—'}
        </span>
      </Card>

      {error && (
        <Alert className="mb-3">{error}</Alert>
      )}

      {insufficientBalance && onAddFunds && (
        <Button variant="secondary" className="mb-3 w-full" onClick={onAddFunds}>
          Add funds to continue
        </Button>
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

function getCategoryStyle(category: string): string {
  const key = category.toLowerCase();

  if (key.includes('crypto') || key.includes('bitcoin')) {
    return 'border-amber-400/40 bg-amber-400/10 text-amber-400';
  }
  if (key.includes('sport')) {
    return 'border-sky-400/40 bg-sky-400/10 text-sky-400';
  }
  if (key.includes('tech')) {
    return 'border-violet-400/40 bg-violet-400/10 text-violet-400';
  }
  if (key.includes('politic') || key.includes('election')) {
    return 'border-rose-400/40 bg-rose-400/10 text-rose-400';
  }
  if (key.includes('entertain') || key.includes('movie')) {
    return 'border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-400';
  }
  if (key.includes('weather') || key.includes('climate')) {
    return 'border-cyan-400/40 bg-cyan-400/10 text-cyan-400';
  }

  return 'border-vantage-accent/35 bg-vantage-accent/10 text-vantage-accent';
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
