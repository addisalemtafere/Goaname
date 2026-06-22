import { useEffect, useRef, useState } from 'react';
import { listCategories } from '../api/categories';
import { TENANT_ID, listMarkets, type MarketDto } from '../api/markets';
import { ActivityPage } from '../components/activity';
import { MarketAdminPanel } from '../components/admin';
import { AuthPanel } from '../components/auth';
import {
  AppSidenav,
  AppTopbar,
  getAppViewMeta,
  getPublicPageMeta,
  PublicNav,
  type AppView,
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
  containerClass,
  EmptyState,
  LoadingOverlay,
  Modal,
  pageBgClass,
  PageHeader,
} from '../components/ui';
import { useAuth } from '../hooks/useAuth';

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
  const [publicPage, setPublicPage] = useState<PublicPage>('markets');
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
  const wasAuthenticated = useRef(isAuthenticated);
  const showTicker = (view: AppView | PublicPage) => view !== 'manage';

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
      wasAuthenticated.current = false;
      return;
    }

    setShowAuthPanel(false);
    if (!wasAuthenticated.current) {
      setActiveView('manage');
    }
    wasAuthenticated.current = true;
  }, [isAuthenticated]);

  function openSignIn() {
    setShowAuthPanel(true);
  }

  function handleLogout() {
    signOut();
    setActiveView('browse');
    setPublicPage('markets');
  }

  const browseContent = (
    <>
      {isAuthenticated && user && user.kycStatus !== 'Verified' && (
        <Alert variant="accent" className="mb-6">
          Link your payout account to enable instant withdrawals.
        </Alert>
      )}

      {error && isAuthenticated && (
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
            isAuthenticated
              ? 'Use Manage markets in the sidenav to create one.'
              : 'Sign in to create and publish markets.'
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
        />
      )}
    </>
  );

  function renderAppContent(view: AppView) {
    switch (view) {
      case 'manage':
        return <MarketAdminPanel onMarketsChanged={refreshMarkets} />;
      case 'leaderboard':
        return <LeaderboardPage />;
      case 'activity':
        return <ActivityPage />;
      default:
        return browseContent;
    }
  }

  function renderPublicContent(page: PublicPage) {
    switch (page) {
      case 'leaderboard':
        return <LeaderboardPage />;
      case 'activity':
        return <ActivityPage />;
      default:
        return browseContent;
    }
  }

  if (isAuthenticated && user) {
    const viewMeta = getAppViewMeta(activeView, false);

    return (
      <>
        <div className={`flex min-h-screen ${pageBgClass}`}>
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
              title={viewMeta.title}
              subtitle={viewMeta.subtitle}
              badge={activeView === 'manage' ? 'Admin' : undefined}
            />
            <div className={`${containerClass} flex-1 ${showTicker(activeView) ? 'pb-14' : ''}`}>
              {renderAppContent(activeView)}
            </div>
            {showTicker(activeView) && <ActivityTicker markets={markets} />}
          </div>
        </div>
        {authLoading && <LoadingOverlay message="Loading account..." />}
      </>
    );
  }

  const publicMeta = getPublicPageMeta(publicPage);

  return (
    <>
      <div className={`min-h-screen ${showTicker(publicPage) ? 'pb-14' : ''} ${pageBgClass}`}>
        <PublicNav
          activePage={publicPage}
          onNavigate={setPublicPage}
          liveCount={markets.length}
          onSignIn={openSignIn}
        />

        <main className={containerClass}>
          <PageHeader
            title={publicMeta.title}
            subtitle={publicMeta.subtitle}
            size="hero"
            className="mb-8"
          />

          {renderPublicContent(publicPage)}
        </main>

        {showTicker(publicPage) && <ActivityTicker markets={markets} />}
      </div>

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

      {authLoading && <LoadingOverlay message="Loading account..." />}
    </>
  );
}

export default App;
