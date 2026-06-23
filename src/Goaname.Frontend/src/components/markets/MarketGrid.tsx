import { useState } from 'react';
import type { PlaceBetResponse } from '../../api/bets';
import type { MarketDto } from '../../api/markets';
import type { Wallet } from '../../api/users';
import { Card } from '../ui';
import { MarketCard, type BetSide } from './MarketCard';

interface MarketGridProps {
  markets: MarketDto[];
  isAuthenticated: boolean;
  onSignIn: () => void;
  onAddFunds?: () => void;
  wallet: Wallet | null;
  onBetPlaced: (marketId: string, response: PlaceBetResponse) => void;
}

export function MarketGrid({
  markets,
  isAuthenticated,
  onSignIn,
  onAddFunds,
  wallet,
  onBetPlaced,
}: MarketGridProps) {
  const [expanded, setExpanded] = useState<{ marketId: string; side: BetSide } | null>(null);

  function handleSelectSide(marketId: string, side: BetSide | null) {
    if (side === null) {
      setExpanded(null);
      return;
    }

    setExpanded((current) =>
      current?.marketId === marketId && current.side === side
        ? null
        : { marketId, side },
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {markets.map((market) => (
        <MarketCard
          key={market.id}
          market={market}
          expandedSide={
            expanded?.marketId === market.id ? expanded.side : null
          }
          onSelectSide={(side) => handleSelectSide(market.id, side)}
          isAuthenticated={isAuthenticated}
          onSignIn={onSignIn}
          onAddFunds={onAddFunds}
          wallet={wallet}
          onBetPlaced={onBetPlaced}
        />
      ))}
    </div>
  );
}

export function MarketGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} variant="surface" className="game-card animate-pulse rounded-2xl p-5">
          <div className="mb-4 flex justify-between">
            <div className="h-5 w-16 rounded bg-vantage-border" />
            <div className="h-4 w-12 rounded bg-vantage-border" />
          </div>
          <div className="mb-2 h-4 w-full rounded bg-vantage-border" />
          <div className="mb-4 h-4 w-3/4 rounded bg-vantage-border" />
          <div className="mb-4 h-2.5 w-full rounded-full bg-vantage-border" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-10 rounded-xl bg-vantage-border" />
            <div className="h-10 rounded-xl bg-vantage-border" />
          </div>
        </Card>
      ))}
    </div>
  );
}
