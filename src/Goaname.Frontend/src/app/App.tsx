import { useEffect, useRef, useState } from 'react';
import type { PlaceBetResponse } from '../api/bets';
import { listCategories } from '../api/categories';
import { listMarkets, type MarketDto } from '../api/markets';
import { ActivityPage } from '../components/activity';
import { AdminShell } from '../components/admin';
import { AuthPanel } from '../components/auth';
import {
  getPublicPageMeta,
  PublicBottomNav,
  PublicNav,
  type AppShell,
  type PublicPage,
} from '../components/layout';
import { LeaderboardPage } from '../components/leaderboard';
import {
  ActivityTicker,
  filterMarkets,
  MarketBrowseFilters,
  MarketGrid,
  MarketGridSkeleton,
  type CategoryFilter,
} from '../components/markets';
import {
  Alert,
  Button,
  EmptyState,
  LoadingOverlay,
  Modal,
  publicContainerClass,
  publicMobileBottomPadClass,
  PageHeader,
} from '../components/ui';
import { DepositPanel } from '../components/wallet';
import { useAuth } from '../hooks/useAuth';
import { isPlayerRole } from '../api/auth';

function App() {
  const { user, wallet, roles, permissions, loading: authLoading, error, isAuthenticated, canAccessAdmin, isSuperAdmin, refresh, signIn, signUp, signOut } = useAuth();
  const [shell, setShell] = useState<AppShell>('public');
  const [publicPage, setPublicPage] = useState<PublicPage>('markets');
  const [showAuthPanel, setShowAuthPanel] = useState(false);
  const [showDepositPanel, setShowDepositPanel] = useState(false);
  const [markets, setMarkets] = useState<MarketDto[]>([]);
  const [marketsLoading, setMarketsLoading] = useState(true);
  const [marketsError, setMarketsError] = useState<string | null>(null);
  const [marketsRefreshKey, setMarketsRefreshKey] = useState(0);
  const [activityRefreshKey, setActivityRefreshKey] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const wasAuthenticated = useRef(false);

  const refreshMarkets = () => setMarketsRefreshKey((current) => current + 1);
  const refreshActivity = () => setActivityRefreshKey((current) => current + 1);
  const filteredMarkets = filterMarkets(markets, searchQuery, selectedCategory);
  const showTicker = (page: PublicPage) => page !== 'activity';
  const isPlayer = isAuthenticated && isPlayerRole(roles);

  function openAddFunds() {
    if (!isAuthenticated) {
      openSignIn();
      return;
    }

    setShowDepositPanel(true);
  }

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
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      setShell('public');
      wasAuthenticated.current = false;
      return;
    }

    setShowAuthPanel(false);

    if (!canAccessAdmin) {
      setShell('public');
    } else if (!wasAuthenticated.current) {
      setShell('admin');
    }

    wasAuthenticated.current = true;
  }, [isAuthenticated, canAccessAdmin, authLoading]);

  function openSignIn() {
    setShowAuthPanel(true);
  }

  function openAdminPanel() {
    if (canAccessAdmin) {
      setShell('admin');
    }
  }

  function handleLogout() {
    signOut();
    setShell('public');
    setPublicPage('markets');
    setMobileNavOpen(false);
  }

  function backToSite(page: PublicPage = 'markets') {
    setShell('public');
    setPublicPage(page);
    setMobileNavOpen(false);
  }

  function handleBetPlaced(marketId: string, response: PlaceBetResponse) {
    setMarkets((current) =>
      current.map((market) =>
        market.id === marketId
          ? {
              ...market,
              yesProbability: response.updatedOdds.yesProbability,
              noProbability: response.updatedOdds.noProbability,
              yesMultiplier: response.updatedOdds.yesMultiplier,
              noMultiplier: response.updatedOdds.noMultiplier,
            }
          : market,
      ),
    );
    void refresh();
    refreshMarkets();
    refreshActivity();
  }

  const browseContent = (
    <>
      {isAuthenticated && user && user.kycStatus !== 'Verified' && (
        <Alert variant="info" className="mb-6">
          Identity verification for withdrawals is coming soon.
        </Alert>
      )}

      {isPlayer && wallet && wallet.balance <= 0 && (
        <Alert variant="accent" className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>Your wallet is empty. Add funds to start placing bets.</span>
            <Button variant="primary" onClick={openAddFunds}>
              Add funds
            </Button>
          </div>
        </Alert>
      )}

      {error && (
        <Alert className="mb-4">{error}</Alert>
      )}

      {marketsError && (
        <Alert className="mb-4">{marketsError}</Alert>
      )}

      {!marketsLoading && (
        <MarketBrowseFilters
          categories={categories}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          onSearchChange={setSearchQuery}
          onCategoryChange={setSelectedCategory}
          resultCount={filteredMarkets.length}
        />
      )}

      {marketsLoading && <MarketGridSkeleton />}

      {!marketsLoading && markets.length === 0 && (
        <EmptyState
          title="No markets yet"
          description={
            !isAuthenticated
              ? 'Sign in to browse and place bets.'
              : isPlayer
                ? 'Add funds to your wallet, then check back when markets are published.'
                : 'Create and publish markets from the admin panel.'
          }
        />
      )}

      {!marketsLoading && markets.length > 0 && filteredMarkets.length === 0 && (
        <EmptyState
          title="No matches found"
          description="Try a different search or category."
        />
      )}

      {!marketsLoading && filteredMarkets.length > 0 && (
        <MarketGrid
          markets={filteredMarkets}
          isAuthenticated={isAuthenticated}
          onSignIn={openSignIn}
          onAddFunds={isAuthenticated ? openAddFunds : undefined}
          wallet={wallet}
          onBetPlaced={handleBetPlaced}
        />
      )}
    </>
  );

  function renderPublicContent(page: PublicPage) {
    switch (page) {
      case 'leaderboard':
        return <LeaderboardPage />;
      case 'activity':
        return (
          <ActivityPage
            isAuthenticated={isAuthenticated}
            refreshKey={activityRefreshKey}
            currency={user?.preferredCurrency ?? wallet?.currency ?? 'USD'}
            onSignIn={openSignIn}
            onBrowseMarkets={() => setPublicPage('markets')}
          />
        );
      default:
        return browseContent;
    }
  }

  const authModal = showAuthPanel && (
    <Modal open={showAuthPanel} onClose={() => setShowAuthPanel(false)}>
      <AuthPanel
        onClose={() => setShowAuthPanel(false)}
        onLogin={async (email, password) => {
          await signIn(email, password);
        }}
        onRegister={async (displayName, email, password) => {
          await signUp(displayName, email, password);
        }}
      />
    </Modal>
  );

  const depositModal = showDepositPanel && user && (
    <Modal open={showDepositPanel} onClose={() => setShowDepositPanel(false)}>
      <DepositPanel
        user={user}
        wallet={wallet}
        onClose={() => setShowDepositPanel(false)}
        onDeposited={() => void refresh()}
      />
    </Modal>
  );

  if (isAuthenticated && user && shell === 'admin' && canAccessAdmin) {
    return (
      <>
        <AdminShell
          user={user}
          permissions={permissions}
          isSuperAdmin={isSuperAdmin}
          onBackToSite={() => backToSite('markets')}
          onLogout={handleLogout}
          onMarketsChanged={() => {
            refreshMarkets();
            refreshActivity();
            void refresh();
          }}
          mobileNavOpen={mobileNavOpen}
          onMobileNavOpen={() => setMobileNavOpen(true)}
          onMobileNavClose={() => setMobileNavOpen(false)}
        />
        {authLoading && <LoadingOverlay message="Loading account..." />}
      </>
    );
  }

  const publicMeta = getPublicPageMeta(publicPage, isAuthenticated);

  return (
    <>
      <div className={`game-shell min-h-screen ${publicMobileBottomPadClass}`}>
        <PublicNav
          activePage={publicPage}
          onNavigate={setPublicPage}
          liveCount={markets.length}
          onSignIn={openSignIn}
          user={user}
          wallet={wallet}
          isPlayer={isPlayer}
          onAddFunds={isPlayer ? openAddFunds : undefined}
          onAdminPanel={canAccessAdmin ? openAdminPanel : undefined}
          onLogout={isAuthenticated ? handleLogout : undefined}
        />

        <main className={publicContainerClass}>
          <PageHeader
            title={publicMeta.title}
            subtitle={publicMeta.subtitle}
            size="hero"
            className="mb-6 sm:mb-8"
          />

          {renderPublicContent(publicPage)}
        </main>

        <PublicBottomNav activePage={publicPage} onNavigate={setPublicPage} />
        {showTicker(publicPage) && <ActivityTicker refreshKey={activityRefreshKey} />}
      </div>

      {authModal}
      {depositModal}

      {authLoading && isAuthenticated && (
        <LoadingOverlay message="Loading account..." />
      )}
    </>
  );
}

export default App;
