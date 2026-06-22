import { useCallback, useEffect, useState } from 'react';
import {
  getMarketBets,
  getMarketOdds,
  TENANT_ID,
  type MarketBets,
  type OddsSnapshot,
} from '../api/markets';

interface MarketDetailsState {
  odds: OddsSnapshot | null;
  bets: MarketBets | null;
  loading: boolean;
  error: string | null;
}

const emptyState = (): MarketDetailsState => ({
  odds: null,
  bets: null,
  loading: false,
  error: null,
});

async function fetchMarketDetails(marketId: string): Promise<Pick<MarketDetailsState, 'odds' | 'bets'>> {
  const [odds, bets] = await Promise.all([
    getMarketOdds(TENANT_ID, marketId),
    getMarketBets(marketId, TENANT_ID),
  ]);

  return { odds, bets };
}

export function useMarketDetails(marketId: string | null) {
  const [state, setState] = useState<MarketDetailsState>(emptyState);

  useEffect(() => {
    if (!marketId) {
      setState(emptyState());
      return;
    }

    let cancelled = false;
    setState((current) => ({ ...current, loading: true, error: null }));

    void fetchMarketDetails(marketId)
      .then(({ odds, bets }) => {
        if (!cancelled) {
          setState({ odds, bets, loading: false, error: null });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            odds: null,
            bets: null,
            loading: false,
            error: err instanceof Error ? err.message : 'Failed to load market details',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [marketId]);

  const refresh = useCallback(async () => {
    if (!marketId) {
      return;
    }

    setState((current) => ({ ...current, loading: true, error: null }));

    try {
      const { odds, bets } = await fetchMarketDetails(marketId);
      setState({ odds, bets, loading: false, error: null });
    } catch (err: unknown) {
      setState({
        odds: null,
        bets: null,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load market details',
      });
    }
  }, [marketId]);

  return { ...state, refresh };
}
