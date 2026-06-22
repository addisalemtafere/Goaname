import { useEffect, useState } from 'react';
import { AuthPanel } from './components/AuthPanel';
import { AppSidenav, getBrowseTitle, getManageTitle, type AppView } from './components/AppSidenav';
import { AppTopbar } from './components/AppTopbar';
import { PublicMarketHeader } from './components/PublicMarketHeader';
import { MarketBrowseFilters, filterMarkets, type CategoryFilter } from './components/MarketBrowseFilters';
import { MarketAdminPanel } from './components/MarketAdminPanel';
import { btnPrimary } from './components/ui/classes';
import { useAuth } from './hooks/useAuth';
import { listCategories, formatCategoryLabel } from './api/categories';
import {
  TENANT_ID,
  daysUntil,
  listMarkets,
  toCardPercent,
  type MarketDto,
} from './api/markets';

async function ensureDemoTenant() {
  await fetch(`/api/tenants/${TENANT_ID}/initialize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Demo Markets', currency: 'USD' }),
  }).catch(() => undefined);
}

function App() {
  const { user, wallet, loading: authLoading, error, isAuthenticated, signIn, signUp, signOut } = useAuth();
  const [activeView, setActiveView] = useState<AppView>('browse');
  const [showAuthPanel, setShowAuthPanel] = useState(false);
  const [markets, setMarkets] = useState<MarketDto[]>([]);
  const [marketsLoading, setMarketsLoading] = useState(true);
  const [marketsError, setMarketsError] = useState<string | null>(null);
  const [marketsRefreshKey, setMarketsRefreshKey] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');

  const refreshMarkets = () => setMarketsRefreshKey((current) => current + 1);
  const filteredMarkets = filterMarkets(markets, searchQuery, selectedCategory);
  const browseMeta = getBrowseTitle(!isAuthenticated);
  const manageMeta = getManageTitle();

  useEffect(() => {
    void ensureDemoTenant();
  }, []);

  useEffect(() => {
    void listCategories()
      .then(setCategories)
      .catch(() => undefined);
  }, [marketsRefreshKey]);

  useEffect(() => {
    let cancelled = false;
    setMarketsLoading(true);
    setMarketsError(null);

    void listMarkets()
      .then((items) => {
        if (!cancelled) {
          setMarkets(items);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setMarketsError(err instanceof Error ? err.message : 'Failed to load markets');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setMarketsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [marketsRefreshKey]);

  useEffect(() => {
    if (!isAuthenticated) {
      setActiveView('browse');
      return;
    }

    setShowAuthPanel(false);
  }, [isAuthenticated]);

  function openSignIn() {
    setShowAuthPanel(true);
  }

  function handleLogout() {
    signOut();
    setActiveView('browse');
  }

  const browseContent = (
    <>
      {!isAuthenticated && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-blue-500/25 bg-blue-500/10 px-5 py-4">
          <span className="text-sm text-slate-400">
            Markets are public. Sign in to place bets and manage markets.
          </span>
          <button type="button" onClick={openSignIn} className={btnPrimary}>
            Sign in
          </button>
        </div>
      )}

      {isAuthenticated && user && user.kycStatus !== 'Verified' && (
        <div className="mb-6 rounded-lg bg-emerald-500 px-4 py-3 text-white">
          Link your payout account to enable instant withdrawals.
        </div>
      )}

      {error && isAuthenticated && (
        <div className="mb-4 text-red-400">{error}</div>
      )}

      {marketsError && (
        <div className="mb-4 text-red-400">{marketsError}</div>
      )}

      {marketsLoading && (
        <div className="mb-4 text-slate-400">Loading markets...</div>
      )}

      {!marketsLoading && (
        <MarketBrowseFilters
          categories={categories}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          onSearchChange={setSearchQuery}
          onCategoryChange={setSelectedCategory}
        />
      )}

      {!marketsLoading && markets.length === 0 && (
        <div className="mb-6 rounded-xl border border-slate-700 p-5 text-slate-400">
          No markets yet.{isAuthenticated ? ' Open Manage markets in the sidenav to create one.' : ' Sign in to create and publish markets.'}
        </div>
      )}

      {!marketsLoading && markets.length > 0 && filteredMarkets.length === 0 && (
        <div className="mb-6 rounded-xl border border-slate-700 p-5 text-slate-400">
          No markets match your search or category filter.
        </div>
      )}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
        {filteredMarkets.map((market) => (
          <div key={market.id} className="rounded-xl border border-slate-700 bg-slate-800 p-5">
            <div className="text-sm text-slate-500">
              {formatCategoryLabel(market.category)} • {daysUntil(market.tradingEndsAt)}d
            </div>
            <h2 className="my-3 text-lg font-semibold text-slate-100">{market.title}</h2>
            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 cursor-pointer rounded-lg border border-emerald-500 bg-emerald-500/10 px-3 py-3 font-bold text-emerald-400"
                onClick={() => !isAuthenticated && openSignIn()}
                title={isAuthenticated ? undefined : 'Sign in to place bets'}
              >
                Yes {market.yesMultiplier.toFixed(2)}x
              </button>
              <button
                type="button"
                className="flex-1 cursor-pointer rounded-lg border border-red-500 bg-red-500/10 px-3 py-3 font-bold text-red-400"
                onClick={() => !isAuthenticated && openSignIn()}
                title={isAuthenticated ? undefined : 'Sign in to place bets'}
              >
                No {market.noMultiplier.toFixed(2)}x
              </button>
            </div>
            <div className="mt-2 text-sm text-slate-500">
              {toCardPercent(market.yesProbability)}% Yes · {toCardPercent(market.noProbability)}% No
            </div>
            <div className="mt-4 flex justify-between text-sm text-slate-400">
              <span>Vol: ${market.totalVolume.toFixed(0)}</span>
              <span>{market.uniqueTraders} Traders</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  if (isAuthenticated && user) {
    return (
      <>
        <div className="flex min-h-screen bg-slate-950">
          <AppSidenav
            activeView={activeView}
            onNavigate={setActiveView}
            user={user}
            wallet={wallet}
            onLogout={handleLogout}
            tenantId={TENANT_ID}
          />

          <div className="flex min-h-screen min-w-0 flex-1 flex-col">
            <AppTopbar
              title={activeView === 'manage' ? manageMeta.title : browseMeta.title}
              subtitle={activeView === 'manage' ? manageMeta.subtitle : browseMeta.subtitle}
              badge={activeView === 'manage' ? 'Admin' : undefined}
            />

            <div className="mx-auto w-full max-w-5xl flex-1 p-8">
              {activeView === 'manage' ? (
                <MarketAdminPanel onMarketsChanged={refreshMarkets} />
              ) : (
                browseContent
              )}
            </div>
          </div>
        </div>

        {authLoading && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 text-slate-400">
            Loading account...
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="flex min-h-screen flex-col bg-slate-950">
        <PublicMarketHeader
          tenantId={TENANT_ID}
          marketCount={markets.length}
          onSignIn={openSignIn}
        />

        <main className="mx-auto w-full max-w-5xl flex-1 p-8">
          <div className="mb-6">
            <h1 className="m-0 text-2xl font-bold text-slate-100">{browseMeta.title}</h1>
            <p className="mt-2 text-sm text-slate-500">{browseMeta.subtitle}</p>
          </div>
          {browseContent}
        </main>
      </div>

      {showAuthPanel && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/70 p-6 backdrop-blur-sm"
          onClick={() => setShowAuthPanel(false)}
        >
          <div className="relative w-full max-w-[420px]" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="absolute top-3 right-3 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-slate-500/15 text-xl text-slate-100"
              onClick={() => setShowAuthPanel(false)}
              aria-label="Close sign in"
            >
              ×
            </button>
            <AuthPanel onLogin={async (email, password) => {
              await signIn(email, password);
            }} onRegister={async (displayName, email, password) => {
              await signUp(displayName, email, password);
            }} />
          </div>
        </div>
      )}
    </>
  );
}

export default App;
